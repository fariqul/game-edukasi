const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const runtimeScriptPath = path.join(__dirname, '..', 'js', 'supabaseRuntime.js');
const runtimeScript = fs.readFileSync(runtimeScriptPath, 'utf8');

test('supabaseRuntime: mengisi default URL project saat config kosong', () => {
    const context = { window: {} };
    vm.runInNewContext(runtimeScript, context);

    assert.equal(
        context.window.GAME_EDUKASI_SUPABASE.url,
        'https://ngcioiearbemwqzavcfp.supabase.co'
    );
    assert.equal(context.window.GAME_EDUKASI_SUPABASE.publishableKey, '');
    assert.equal(context.window.GAME_EDUKASI_SUPABASE.anonKey, '');
});

test('supabaseRuntime: mempertahankan config valid dari runtime global', () => {
    const context = {
        window: {
            GAME_EDUKASI_SUPABASE: {
                url: ' https://custom.supabase.co ',
                publishableKey: ' sb_publishable_custom_123 ',
                anonKey: ' anon-key ',
                realtimeChannelPrefix: ' kelas-x '
            }
        }
    };
    vm.runInNewContext(runtimeScript, context);

    assert.equal(context.window.GAME_EDUKASI_SUPABASE.url, 'https://custom.supabase.co');
    assert.equal(context.window.GAME_EDUKASI_SUPABASE.publishableKey, 'sb_publishable_custom_123');
    assert.equal(context.window.GAME_EDUKASI_SUPABASE.anonKey, 'anon-key');
    assert.equal(context.window.GAME_EDUKASI_SUPABASE.realtimeChannelPrefix, 'kelas-x');
});
