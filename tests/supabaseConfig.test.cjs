const test = require('node:test');
const assert = require('node:assert/strict');
const { getSupabaseConfig } = require('../js/supabaseConfig.js');

test('getSupabaseConfig: disabled bila URL atau anon key kosong', () => {
    const cfg = getSupabaseConfig({});
    assert.equal(cfg.enabled, false);
    assert.equal(cfg.url, '');
    assert.equal(cfg.publishableKey, '');
    assert.equal(cfg.anonKey, '');
    assert.equal(cfg.clientKey, '');
});

test('getSupabaseConfig: enabled bila URL dan anon key valid', () => {
    const cfg = getSupabaseConfig({
        url: 'https://abcxyz.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real.value',
        realtimeChannelPrefix: 'kelas-10'
    });

    assert.equal(cfg.enabled, true);
    assert.equal(cfg.url, 'https://abcxyz.supabase.co');
    assert.equal(cfg.clientKey, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real.value');
    assert.equal(cfg.realtimeChannelPrefix, 'kelas-10');
    assert.equal(cfg.tables.gameSessions, 'game_sessions');
});

test('getSupabaseConfig: publishable key diprioritaskan untuk client key', () => {
    const cfg = getSupabaseConfig({
        url: 'https://abcxyz.supabase.co',
        anonKey: 'anon-legacy',
        publishableKey: 'sb_publishable_test_123'
    });

    assert.equal(cfg.enabled, true);
    assert.equal(cfg.publishableKey, 'sb_publishable_test_123');
    assert.equal(cfg.anonKey, 'anon-legacy');
    assert.equal(cfg.clientKey, 'sb_publishable_test_123');
});
