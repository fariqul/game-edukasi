const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const clientScriptPath = path.join(__dirname, '..', 'js', 'supabaseClient.js');
const clientScript = fs.readFileSync(clientScriptPath, 'utf8');

test('supabaseClient: tidak membuat client saat config disabled', () => {
    let called = false;
    const context = {
        window: {
            supabase: {
                createClient() {
                    called = true;
                    return {};
                }
            },
            SupabaseGameConfig: {
                getSupabaseConfig() {
                    return { enabled: false, url: '', anonKey: '' };
                }
            },
            GAME_EDUKASI_SUPABASE: {}
        }
    };

    vm.runInNewContext(clientScript, context);

    assert.equal(called, false);
    assert.equal(context.window.GameSupabase.enabled, false);
    assert.equal(context.window.GameSupabase.client, null);
});

test('supabaseClient: membuat client saat config enabled', () => {
    const created = [];
    const context = {
        window: {
            supabase: {
                createClient(url, key, options) {
                    created.push({ url, key, options });
                    return { tag: 'client-ok' };
                }
            },
            SupabaseGameConfig: {
                getSupabaseConfig() {
                    return {
                        enabled: true,
                        url: 'https://ngcioiearbemwqzavcfp.supabase.co',
                        clientKey: 'anon-123'
                    };
                }
            },
            GAME_EDUKASI_SUPABASE: {}
        }
    };

    vm.runInNewContext(clientScript, context);

    assert.equal(created.length, 1);
    assert.equal(created[0].url, 'https://ngcioiearbemwqzavcfp.supabase.co');
    assert.equal(created[0].key, 'anon-123');
    assert.equal(context.window.GameSupabase.enabled, true);
    assert.equal(context.window.GameSupabase.client.tag, 'client-ok');
});

test('supabaseClient: memakai publishable key saat tersedia', () => {
    const created = [];
    const context = {
        window: {
            supabase: {
                createClient(url, key) {
                    created.push({ url, key });
                    return { ok: true };
                }
            },
            SupabaseGameConfig: {
                getSupabaseConfig() {
                    return {
                        enabled: true,
                        url: 'https://ngcioiearbemwqzavcfp.supabase.co',
                        publishableKey: 'sb_publishable_live_abc',
                        anonKey: 'anon-legacy',
                        clientKey: 'sb_publishable_live_abc'
                    };
                }
            },
            GAME_EDUKASI_SUPABASE: {}
        }
    };

    vm.runInNewContext(clientScript, context);
    assert.equal(created.length, 1);
    assert.equal(created[0].key, 'sb_publishable_live_abc');
});
