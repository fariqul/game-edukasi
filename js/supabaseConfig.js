/**
 * Runtime config helper untuk integrasi Supabase.
 * Tidak menginisialisasi client; hanya normalisasi konfigurasi.
 */
(function (globalScope) {
    const DEFAULT_TABLES = {
        profiles: 'profiles',
        classRooms: 'class_rooms',
        classMembers: 'class_members',
        gameSessions: 'game_sessions',
        sessionParticipants: 'session_participants',
        sessionEvents: 'session_events',
        sessionRankings: 'session_rankings'
    };

    function cleanString(value) {
        return typeof value === 'string' ? value.trim() : '';
    }

    function isPlaceholder(value) {
        const raw = cleanString(value).toLowerCase();
        return raw === '' || raw.includes('your_') || raw.includes('placeholder');
    }

    function getSupabaseConfig(rawConfig) {
        const config = rawConfig && typeof rawConfig === 'object' ? rawConfig : {};
        const url = cleanString(config.url);
        const publishableKey = cleanString(config.publishableKey);
        const anonKey = cleanString(config.anonKey);
        const clientKey = !isPlaceholder(publishableKey) ? publishableKey : anonKey;
        const realtimeChannelPrefix = cleanString(config.realtimeChannelPrefix) || 'kelas-room';
        const tables = { ...DEFAULT_TABLES, ...(config.tables || {}) };

        return {
            url,
            publishableKey,
            anonKey,
            clientKey,
            realtimeChannelPrefix,
            tables,
            enabled: !isPlaceholder(url) && !isPlaceholder(clientKey)
        };
    }

    const api = { getSupabaseConfig };
    globalScope.SupabaseGameConfig = api;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
