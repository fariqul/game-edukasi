/**
 * Supabase client bootstrap.
 * Mengekspos window.GameSupabase bila konfigurasi valid.
 */
(function (globalScope) {
    const hasFactory = globalScope.supabase && typeof globalScope.supabase.createClient === 'function';
    const hasConfigHelper = typeof globalScope.SupabaseGameConfig !== 'undefined'
        && typeof globalScope.SupabaseGameConfig.getSupabaseConfig === 'function';

    if (!hasFactory || !hasConfigHelper) return;

    const config = globalScope.SupabaseGameConfig.getSupabaseConfig(globalScope.GAME_EDUKASI_SUPABASE || {});
    if (!config.enabled) {
        globalScope.GameSupabase = { enabled: false, config, client: null };
        return;
    }

    const client = globalScope.supabase.createClient(config.url, config.clientKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true
        }
    });

    globalScope.GameSupabase = {
        enabled: true,
        config,
        client
    };
})(typeof window !== 'undefined' ? window : globalThis);
