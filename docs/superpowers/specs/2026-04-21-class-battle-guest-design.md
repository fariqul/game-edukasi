# Desain Fitur: Class Battle Tamu (Tanpa Login)

## Ringkasan Masalah
Flow mabar saat ini masih 1v1 berbasis PeerJS. Kebutuhan baru adalah mode kelas dengan banyak peserta (maks 30), tanpa login, cukup nama + kode sesi, dengan ranking realtime dan pembersihan data otomatis setelah sesi selesai.

## Tujuan
1. Host membuat sesi kelas dengan mode game tunggal dan target level akhir.
2. Peserta bergabung memakai nama + kode sesi.
3. Saat game berjalan, hasil peserta masuk ke ranking realtime.
4. Ranking final memakai urutan `score DESC, time_ms ASC`.
5. Setelah peserta pertama selesai, mulai countdown 10 detik untuk menutup sesi.
6. Data sesi otomatis dibersihkan 10 menit setelah selesai.

## Ruang Lingkup
- Menambah mode **Kelas Tamu** di alur multiplayer.
- Integrasi Supabase (database + realtime channel).
- UI minimum untuk create/join/start sesi dan melihat ranking realtime.
- Sinkronisasi status sesi: `waiting -> in_progress -> finished`.

## Di Luar Ruang Lingkup
- Login/auth user permanen.
- Manajemen kelas formal (CRUD kelas, roster, role guru/siswa berbasis akun).
- Riwayat jangka panjang lintas sesi.

## Arsitektur Solusi (Hybrid - Direkomendasikan)
Menggabungkan:
1. **Tabel Supabase** sebagai sumber kebenaran sesi, peserta, submission, dan ranking.
2. **Supabase Realtime channel** per sesi untuk event cepat (start game, finish window countdown, force finish).

Alasan:
- Lebih andal dibanding realtime-only untuk recovery koneksi.
- Lebih responsif dibanding tabel-only untuk event live.

## Komponen Frontend
1. `js/classBattleService.js`
   - Akses Supabase untuk create/join/start/submit/finish/cleanup.
   - Validasi status sesi dan kapasitas peserta.
2. `js/classBattleState.js`
   - Menyimpan state runtime (sessionId, sessionCode, participantToken, role, countdown).
3. Integrasi ke `js/multiplayer.js`
   - Jalur baru untuk room kelas (selain 1v1 lama).
   - Hook event selesai level agar submission masuk ke Supabase.
4. Integrasi ke `js/main.js`
   - Menghitung score per pencapaian level dan waktu.
   - Menahan navigasi lanjut saat sesi sudah ditutup.

## Model Data Supabase (Guest Ephemeral)
### 1) `public.guest_sessions`
- `id uuid pk`
- `session_code text unique`
- `host_name text`
- `host_token text`
- `mode text`
- `target_level integer`
- `max_participants integer default 30`
- `status text check in ('waiting','in_progress','finished','cancelled')`
- `first_finish_started_at timestamptz null`
- `finish_countdown_seconds integer default 10`
- `started_at timestamptz null`
- `ended_at timestamptz null`
- `cleanup_at timestamptz null`
- `created_at timestamptz default now()`

### 2) `public.guest_participants`
- `id uuid pk`
- `session_id uuid fk -> guest_sessions.id`
- `display_name text`
- `normalized_name text`
- `name_suffix integer default 1`
- `player_token text`
- `is_host boolean default false`
- `joined_at timestamptz default now()`
- Unique: `(session_id, normalized_name, name_suffix)`

### 3) `public.guest_submissions`
- `id uuid pk`
- `session_id uuid fk`
- `participant_id uuid fk`
- `reached_level integer`
- `score integer`
- `time_ms integer`
- `submitted_at timestamptz default now()`
- Unique: `(session_id, participant_id)` (upsert terakhir)

## Aturan Game
1. Host pilih satu mode dan target level akhir (contoh level 5).
2. Sesi berjalan sampai:
   - countdown 10 detik setelah first finisher habis, atau
   - host menutup sesi.
3. Submission hanya diterima selama status `in_progress`.
4. Saat status berubah `finished`, klien stop menerima submission baru.

## Rumus Ranking
Sorting final:
1. `score` tertinggi
2. jika skor sama, `time_ms` tercepat
3. fallback `submitted_at` paling awal

Score dihitung frontend dari progres ke target level + bonus kecepatan, lalu dikirim saat submit.

## Realtime & Sinkronisasi
Channel per sesi: `kelas-room:<session_code>`
- Event:
  - `session-started`
  - `first-finish-window-started`
  - `session-finished`
  - `ranking-updated`

Recovery:
- Jika realtime putus, klien polling ranking 2 detik sekali sampai channel pulih.

## Error Handling
- Join ditolak bila sesi full/expired/finished.
- Nama duplikat diberi suffix otomatis (`#2`, `#3`, dst).
- Submit gagal: retry 1x, lalu tampil toast error.
- Jika host keluar saat in_progress, sesi langsung ditutup dengan status `cancelled`.

## Pembersihan Data
- Set `cleanup_at = ended_at + interval '10 minutes'`.
- Frontend host memicu cleanup ringan saat membuka lobby berikutnya.
- Tambahan fungsi SQL cleanup dapat dipanggil berkala (manual/cron) untuk hard cleanup.

## Strategi Testing (TDD)
1. Unit test helper:
   - `computeClassBattleScore`
   - `rankSubmissions`
   - `resolveDuplicateDisplayName`
   - `shouldLockSubmission`
2. Unit test service:
   - create/join validation
   - countdown start hanya sekali pada first finisher
   - reject submit setelah sesi `finished`
3. Integrasi ringan:
   - alur host create -> participant join -> start -> submit -> ranking update.

## Rencana Implementasi Bertahap
1. SQL migration guest tables + policy anon terbatas.
2. Service + state module untuk class battle.
3. Integrasi UI lobby + ranking panel.
4. Integrasi event selesai level ke submission.
5. Countdown lock + finish session.
6. Cleanup otomatis + fallback polling.
7. Test coverage dan hardening.
