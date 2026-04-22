/**
 * Multiplayer runtime config normalizer.
 * Digunakan oleh multiplayer.js agar bisa memakai PeerJS server custom + STUN/TURN.
 */
(function (globalScope) {
    const DEFAULT_PREFIX = 'infolab_';

    function normalizePath(pathValue) {
        const raw = typeof pathValue === 'string' ? pathValue.trim() : '';
        if (!raw) return '/peerjs';
        return raw.startsWith('/') ? raw : `/${raw}`;
    }

    function normalizeUrls(urlsValue) {
        if (typeof urlsValue === 'string') {
            const cleaned = urlsValue.trim();
            return cleaned ? [cleaned] : [];
        }
        if (!Array.isArray(urlsValue)) return [];
        return urlsValue
            .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
            .filter(Boolean);
    }

    function normalizeIceServer(serverValue) {
        if (!serverValue || typeof serverValue !== 'object') return null;

        const urls = normalizeUrls(serverValue.urls);
        if (urls.length === 0) return null;

        const firstUrl = urls[0].toLowerCase();
        const needsCredential = firstUrl.startsWith('turn:') || firstUrl.startsWith('turns:');
        const username = typeof serverValue.username === 'string' ? serverValue.username.trim() : '';
        const credential = typeof serverValue.credential === 'string' ? serverValue.credential.trim() : '';

        if (needsCredential && (!username || !credential)) {
            return null;
        }

        const normalized = { urls };
        if (username) normalized.username = username;
        if (credential) normalized.credential = credential;
        return normalized;
    }

    function getConfig(rawConfig) {
const config = { maxPlayers: 8, ...((rawConfig && typeof rawConfig === 'object') ? rawConfig : {})};
        const signaling = config.signaling && typeof config.signaling === 'object' ? config.signaling : {};
        const rtc = config.rtc && typeof config.rtc === 'object' ? config.rtc : {};

        const prefix = typeof config.prefix === 'string' && config.prefix.trim()
            ? config.prefix.trim()
            : DEFAULT_PREFIX;

        const peerOptions = { debug: 0 };
        const host = typeof signaling.host === 'string' ? signaling.host.trim() : '';
        if (host) {
            peerOptions.host = host;
            peerOptions.path = normalizePath(signaling.path);
            peerOptions.secure = typeof signaling.secure === 'boolean' ? signaling.secure : true;

            const port = Number(signaling.port);
            if (Number.isInteger(port) && port > 0) {
                peerOptions.port = port;
            }
        }

        const rawIceServers = Array.isArray(rtc.iceServers) ? rtc.iceServers : [];
        peerOptions.config = {
            iceServers: rawIceServers.map(normalizeIceServer).filter(Boolean)
        };

return { prefix, peerOptions, maxPlayers: config.maxPlayers || 8 };
    }

    const api = { getConfig };
    globalScope.MultiplayerConfig = api;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
