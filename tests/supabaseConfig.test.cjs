const test = require('node:test');
const assert = require('node:assert/strict');
const { getSupabaseConfig } = require('../js/supabaseConfig.js');

test('getSupabaseConfig: disabled bila URL atau anon key kosong', () => {
    const cfg = getSupabaseConfig({});
    assert.equal(cfg.enabled, false);
    assert.equal(cfg.url, '');
    assert.equal(cfg.anonKey, '');
});

test('getSupabaseConfig: enabled bila URL dan anon key valid', () => {
    const cfg = getSupabaseConfig({
        url: 'https://abcxyz.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real.value',
        realtimeChannelPrefix: 'kelas-10'
    });

    assert.equal(cfg.enabled, true);
    assert.equal(cfg.url, 'https://abcxyz.supabase.co');
    assert.equal(cfg.realtimeChannelPrefix, 'kelas-10');
    assert.equal(cfg.tables.gameSessions, 'game_sessions');
});
