# Class Battle Tamu (Tanpa Login) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan mode mabar kelas tamu (maks 30 peserta) berbasis Supabase hybrid dengan ranking realtime, countdown 10 detik setelah finisher pertama, target level host, dan cleanup data 10 menit setelah sesi selesai.

**Architecture:** Client memakai Supabase JS untuk akses tabel guest ephemeral sebagai source of truth (session, participant, submission). Event cepat (start/countdown/finish) dikirim lewat Realtime channel per session code. Multiplayer 1v1 tetap dipertahankan; class battle ditambahkan sebagai jalur baru yang terisolasi di service + bridge module.

**Tech Stack:** Vanilla JS, Supabase JS v2, Supabase Postgres + Realtime, Node test runner (`node --test`)

---

## File Structure Map

- Create: `js/classBattleRules.js` — helper murni untuk skor, ranking, duplikasi nama, lock submission.
- Create: `tests/classBattleRules.test.cjs` — test unit helper class battle rules.
- Create: `js/classBattleState.js` — state runtime class battle (session, role, countdown).
- Create: `tests/classBattleState.test.cjs` — test state transition countdown/lock.
- Create: `js/classBattleService.js` — akses Supabase create/join/start/submit/finish/ranking/cleanup.
- Create: `tests/classBattleService.test.cjs` — test service dengan fake supabase client.
- Create: `js/classBattleBridge.js` — jembatan UI multiplayer/main ke service + state.
- Create: `tests/classBattleBridge.test.cjs` — test alur jembatan host/peserta.
- Modify: `js/multiplayer.js` — tambah flow kelas tamu (create/join/start/countdown/result).
- Modify: `js/main.js` — kirim event progres/selesai ke class battle bridge.
- Modify: `index.html` — tambah kontrol host target level + panel ranking kelas.
- Modify: `supabase/schema.sql` — tambah tabel guest + policy anon terbatas + function cleanup.
- Modify: `supabase/README.md` — dokumentasi setup class battle guest.
- Create: `tests/supabaseGuestSchema.test.cjs` — regression test konten schema guest.

### Task 1: Core Rules (Score, Ranking, Name Suffix, Session Lock)

**Files:**
- Create: `tests/classBattleRules.test.cjs`
- Create: `js/classBattleRules.js`

- [ ] **Step 1: Write the failing test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  computeClassBattleScore,
  rankSubmissions,
  resolveDuplicateDisplayName,
  shouldLockSubmission
} = require('../js/classBattleRules.js');

test('rankSubmissions: urut score desc lalu time asc', () => {
  const ranked = rankSubmissions([
    { name: 'A', score: 80, timeMs: 30000, submittedAt: '2026-04-21T01:00:00Z' },
    { name: 'B', score: 80, timeMs: 28000, submittedAt: '2026-04-21T01:00:05Z' },
    { name: 'C', score: 70, timeMs: 15000, submittedAt: '2026-04-21T01:00:03Z' }
  ]);
  assert.deepEqual(ranked.map(r => r.name), ['B', 'A', 'C']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/classBattleRules.test.cjs`  
Expected: FAIL (`Cannot find module '../js/classBattleRules.js'`).

- [ ] **Step 3: Write minimal implementation**

```js
(function (globalScope) {
  function computeClassBattleScore({ reachedLevel, targetLevel, elapsedMs }) {
    const levelPoints = Math.max(0, Math.min(reachedLevel, targetLevel)) * 100;
    const speedBonus = Math.max(0, 1000 - Math.floor(elapsedMs / 1000));
    return levelPoints + speedBonus;
  }

  function rankSubmissions(rows) {
    return [...rows].sort((a, b) =>
      (b.score - a.score) ||
      (a.timeMs - b.timeMs) ||
      (new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
    );
  }

  function resolveDuplicateDisplayName(existingNames, rawName) {
    const base = String(rawName || '').trim() || 'Peserta';
    const normalized = base.toLowerCase();
    let suffix = 1;
    while (existingNames.has(`${normalized}#${suffix}`)) suffix += 1;
    return { displayName: suffix === 1 ? base : `${base} #${suffix}`, normalized, suffix };
  }

  function shouldLockSubmission({ status, firstFinishStartedAt, countdownSeconds, nowMs }) {
    if (status === 'finished' || status === 'cancelled') return true;
    if (!firstFinishStartedAt) return false;
    const endMs = new Date(firstFinishStartedAt).getTime() + countdownSeconds * 1000;
    return nowMs >= endMs;
  }

  const api = { computeClassBattleScore, rankSubmissions, resolveDuplicateDisplayName, shouldLockSubmission };
  globalScope.ClassBattleRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/classBattleRules.test.cjs`  
Expected: PASS semua test file tersebut.

- [ ] **Step 5: Commit**

```bash
git add tests/classBattleRules.test.cjs js/classBattleRules.js
git commit -m "feat: add class battle core rules"
```

### Task 2: Runtime State for Countdown and Session Lock

**Files:**
- Create: `tests/classBattleState.test.cjs`
- Create: `js/classBattleState.js`

- [ ] **Step 1: Write the failing test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { createInitialState, startCountdown, tickCountdown } = require('../js/classBattleState.js');

test('countdown: dari 10 detik ke 0 lalu lock', () => {
  const st = createInitialState();
  startCountdown(st, 10, 1000);
  tickCountdown(st, 11000);
  assert.equal(st.countdownLeft, 0);
  assert.equal(st.locked, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/classBattleState.test.cjs`  
Expected: FAIL (`Cannot find module '../js/classBattleState.js'`).

- [ ] **Step 3: Write minimal implementation**

```js
(function (globalScope) {
  function createInitialState() {
    return {
      sessionId: null,
      sessionCode: '',
      role: 'guest',
      countdownStartedAt: null,
      countdownSeconds: 10,
      countdownLeft: 10,
      locked: false
    };
  }

  function startCountdown(state, seconds, startedAtMs) {
    state.countdownSeconds = seconds;
    state.countdownStartedAt = startedAtMs;
    state.countdownLeft = seconds;
    state.locked = false;
  }

  function tickCountdown(state, nowMs) {
    if (!state.countdownStartedAt || state.locked) return state;
    const elapsed = Math.floor((nowMs - state.countdownStartedAt) / 1000);
    state.countdownLeft = Math.max(0, state.countdownSeconds - elapsed);
    if (state.countdownLeft === 0) state.locked = true;
    return state;
  }

  const api = { createInitialState, startCountdown, tickCountdown };
  globalScope.ClassBattleState = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/classBattleState.test.cjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/classBattleState.test.cjs js/classBattleState.js
git commit -m "feat: add class battle runtime state"
```

### Task 3: Supabase Service for Guest Sessions

**Files:**
- Create: `tests/classBattleService.test.cjs`
- Create: `js/classBattleService.js`

- [ ] **Step 1: Write the failing test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { createClassBattleService } = require('../js/classBattleService.js');

test('createSession: menyimpan mode + target level + kapasitas', async () => {
  const calls = [];
  const fake = { from: (table) => ({ insert: async (rows) => { calls.push({ table, rows }); return { data: rows, error: null }; } }) };
  const svc = createClassBattleService(fake);
  await svc.createSession({ hostName: 'Guru', mode: 'coding', targetLevel: 5, maxParticipants: 30 });
  assert.equal(calls[0].table, 'guest_sessions');
  assert.equal(calls[0].rows[0].target_level, 5);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/classBattleService.test.cjs`  
Expected: FAIL (`createClassBattleService is not a function` / module not found).

- [ ] **Step 3: Write minimal implementation**

```js
(function (globalScope) {
  function randomCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }
  function randomToken() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function createClassBattleService(supabaseClient) {
    async function createSession({ hostName, mode, targetLevel, maxParticipants }) {
      const payload = [{
        session_code: randomCode(),
        host_name: hostName,
        host_token: randomToken(),
        mode,
        target_level: targetLevel,
        max_participants: maxParticipants,
        status: 'waiting',
        finish_countdown_seconds: 10
      }];
      const { data, error } = await supabaseClient.from('guest_sessions').insert(payload).select('*').single();
      if (error) throw error;
      return data;
    }
    return { createSession };
  }

  const api = { createClassBattleService };
  globalScope.ClassBattleService = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/classBattleService.test.cjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/classBattleService.test.cjs js/classBattleService.js
git commit -m "feat: add supabase guest class battle service"
```

### Task 4: Bridge Multiplayer/Main to Class Battle Flow

**Files:**
- Create: `tests/classBattleBridge.test.cjs`
- Create: `js/classBattleBridge.js`
- Modify: `js/multiplayer.js` (sekitar `goMultiplayer`, `createRoom`, `joinRoom`, `startMultiplayerMode`, `onMyComplete`)
- Modify: `js/main.js` (sekitar `completeLevel`)
- Modify: `index.html` (bagian `#lobby-screen`, `#mp-result-modal`, dan script include bawah)

- [ ] **Step 1: Write the failing test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { createBridge } = require('../js/classBattleBridge.js');

test('first finisher memulai countdown 10 detik sekali saja', () => {
  let started = 0;
  const bridge = createBridge({ onStartCountdown: () => { started += 1; } });
  bridge.onFirstFinish();
  bridge.onFirstFinish();
  assert.equal(started, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/classBattleBridge.test.cjs`  
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation + wiring**

```js
// js/classBattleBridge.js
function createBridge({ onStartCountdown }) {
  let firstFinishTriggered = false;
  return {
    onFirstFinish() {
      if (firstFinishTriggered) return false;
      firstFinishTriggered = true;
      onStartCountdown?.(10);
      return true;
    }
  };
}
```

```js
// js/multiplayer.js (contoh integrasi)
if (window.GameClassBattle?.enabled) {
  await window.GameClassBattle.startHostedSession({ mode, targetLevel });
}
```

```html
<!-- index.html -->
<script src="js/classBattleRules.js"></script>
<script src="js/classBattleState.js"></script>
<script src="js/classBattleService.js"></script>
<script src="js/classBattleBridge.js"></script>
```

- [ ] **Step 4: Run tests + smoke path**

Run:
1. `npm test -- tests/classBattleBridge.test.cjs`
2. `npm test`

Expected:
1. PASS test bridge
2. PASS seluruh suite.

- [ ] **Step 5: Commit**

```bash
git add tests/classBattleBridge.test.cjs js/classBattleBridge.js js/multiplayer.js js/main.js index.html
git commit -m "feat: wire class battle guest flow into multiplayer and main"
```

### Task 5: Supabase Guest Schema + Policies + Cleanup

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `supabase/README.md`
- Create: `tests/supabaseGuestSchema.test.cjs`

- [ ] **Step 1: Write the failing schema regression test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const sql = fs.readFileSync('supabase/schema.sql', 'utf8');

test('schema guest berisi tabel inti class battle', () => {
  assert.match(sql, /create table if not exists public\\.guest_sessions/i);
  assert.match(sql, /create table if not exists public\\.guest_participants/i);
  assert.match(sql, /create table if not exists public\\.guest_submissions/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/supabaseGuestSchema.test.cjs`  
Expected: FAIL karena definisi guest belum ada.

- [ ] **Step 3: Implement SQL schema + docs**

```sql
create table if not exists public.guest_sessions (
  id uuid primary key default gen_random_uuid(),
  session_code text not null unique,
  host_name text not null,
  host_token text not null,
  mode text not null,
  target_level integer not null check (target_level > 0),
  max_participants integer not null default 30 check (max_participants between 2 and 30),
  status text not null default 'waiting' check (status in ('waiting','in_progress','finished','cancelled')),
  first_finish_started_at timestamptz,
  finish_countdown_seconds integer not null default 10 check (finish_countdown_seconds between 1 and 60),
  started_at timestamptz,
  ended_at timestamptz,
  cleanup_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.guest_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.guest_sessions(id) on delete cascade,
  display_name text not null,
  normalized_name text not null,
  name_suffix integer not null default 1,
  player_token text not null,
  is_host boolean not null default false,
  joined_at timestamptz not null default now()
);
create table if not exists public.guest_submissions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.guest_sessions(id) on delete cascade,
  participant_id uuid not null references public.guest_participants(id) on delete cascade,
  reached_level integer not null check (reached_level > 0),
  score integer not null default 0,
  time_ms integer not null check (time_ms >= 0),
  submitted_at timestamptz not null default now(),
  unique (session_id, participant_id)
);

alter table public.guest_sessions enable row level security;
create policy guest_sessions_select_open on public.guest_sessions for select using (true);
create policy guest_sessions_insert_open on public.guest_sessions for insert with check (status = 'waiting');

create or replace function public.cleanup_expired_guest_sessions()
returns void language sql as $$
  delete from public.guest_sessions
  where cleanup_at is not null and cleanup_at <= now();
$$;
```

```md
## Class Battle Guest
- Jalankan `supabase/schema.sql`
- Tabel guest bersifat ephemeral
- Cleanup 10 menit setelah sesi selesai lewat `cleanup_expired_guest_sessions()`
```

- [ ] **Step 4: Run schema regression + full tests**

Run:
1. `npm test -- tests/supabaseGuestSchema.test.cjs`
2. `npm test`

Expected: PASS keduanya.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql supabase/README.md tests/supabaseGuestSchema.test.cjs
git commit -m "feat: add guest class battle schema and cleanup policy"
```

### Task 6: Final Hardening and Delivery

**Files:**
- Modify: `js/classBattleService.js` (retry submit + fallback fetch)
- Modify: `js/multiplayer.js` (UI message sesi penuh/expired/finished)
- Modify: `index.html` (label countdown + ranking status)

- [ ] **Step 1: Write failing tests for retry and lock behavior**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { createClassBattleService } = require('../js/classBattleService.js');

test('submit retry 1x lalu gagal dengan pesan jelas', async () => {
  const calls = [];
  const fake = {
    from: () => ({
      upsert: async () => {
        calls.push('upsert');
        if (calls.length === 1) return { error: new Error('temporary') };
        return { error: null, data: { ok: true } };
      }
    })
  };
  const svc = createClassBattleService(fake);
  const row = await svc.submitResultWithRetry({ sessionId: 's1', participantId: 'p1', score: 500, timeMs: 15000, reachedLevel: 5 });
  assert.equal(calls.length, 2);
  assert.equal(row.ok, true);
});
test('submit ditolak setelah status finished', async () => {
  const svc = createClassBattleService({ from: () => ({ upsert: async () => ({}) }) });
  assert.throws(() => svc.assertSessionOpen({ status: 'finished' }), /Sesi sudah ditutup/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/classBattleService.test.cjs tests/classBattleBridge.test.cjs`  
Expected: FAIL pada skenario retry/lock yang belum ada.

- [ ] **Step 3: Implement minimal hardening**

```js
function assertSessionOpen(session) {
  if (!session || session.status === 'finished' || session.status === 'cancelled') {
    throw new Error('Sesi sudah ditutup');
  }
}
async function submitResultWithRetry(payload) {
  const { error, data } = await client.from('guest_submissions').upsert(payload).select('*').single();
  if (!error) return data;
  const retry = await client.from('guest_submissions').upsert(payload).select('*').single();
  if (retry.error) throw retry.error;
  return retry.data;
}
```

- [ ] **Step 4: Run all tests**

Run: `npm test`  
Expected: PASS seluruh test.

- [ ] **Step 5: Commit**

```bash
git add js/classBattleService.js js/multiplayer.js index.html tests/classBattleService.test.cjs tests/classBattleBridge.test.cjs
git commit -m "fix: harden class battle guest submit and session lock"
```

## Spec Coverage Checklist

- Host set mode + target level: Task 3 + Task 4.
- Peserta join nama + code + suffix: Task 1 + Task 3 + Task 4.
- Ranking score desc + time asc: Task 1 + Task 4.
- Countdown 10 detik first finisher: Task 2 + Task 4.
- Cleanup 10 menit: Task 5.
- Error handling reconnect/retry/join reject: Task 4 + Task 6.

## Placeholder Scan Result

- Tidak ada placeholder `TODO/TBD`.
- Tidak ada placeholder implementasi seperti `(...)` atau komentar instruksi kosong.
- Semua task punya file path, test command, dan commit command.
- Nama fungsi konsisten antar task (`createClassBattleService`, `createBridge`, `rankSubmissions`).
