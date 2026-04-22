const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const sql = fs.readFileSync('supabase/schema.sql', 'utf8');

test('schema guest berisi tabel inti class battle', () => {
    assert.match(sql, /create table if not exists public\.guest_sessions/i);
    assert.match(sql, /create table if not exists public\.guest_participants/i);
    assert.match(sql, /create table if not exists public\.guest_submissions/i);
});

test('schema guest berisi fungsi cleanup sesi expired', () => {
    assert.match(sql, /create or replace function public\.cleanup_expired_guest_sessions\(\)/i);
});
