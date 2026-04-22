/**
 * Runtime config Supabase untuk game.
 * Catatan: gunakan URL + anon key (bukan connection string Postgres) di frontend.
 */
(function (globalScope) {
    const current = globalScope.GAME_EDUKASI_SUPABASE || {};

    globalScope.GAME_EDUKASI_SUPABASE = {
        url: typeof current.url === 'string' && current.url.trim()
            ? current.url.trim()
            : 'https://ngcioiearbemwqzavcfp.supabase.co',
        publishableKey: typeof current.publishableKey === 'string'
            ? current.publishableKey.trim()
            : '',
        anonKey: typeof current.anonKey === 'string'
            ? current.anonKey.trim()
            : '',
        realtimeChannelPrefix: typeof current.realtimeChannelPrefix === 'string' && current.realtimeChannelPrefix.trim()
            ? current.realtimeChannelPrefix.trim()
            : 'kelas-room',
        tables: typeof current.tables === 'object' && current.tables !== null
            ? current.tables
            : {}
    };
})(typeof window !== 'undefined' ? window : globalThis);
