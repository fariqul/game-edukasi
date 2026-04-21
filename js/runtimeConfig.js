/**
 * Konfigurasi runtime untuk deploy publik.
 * Isi host Render + TURN credentials di sini (atau inject dari script lain sebelum file ini).
 */
(function (globalScope) {
    const current = globalScope.GAME_EDUKASI_CONFIG || {};
    const currentMultiplayer = current.multiplayer || {};
    const currentSignaling = currentMultiplayer.signaling || {};
    const currentRtc = currentMultiplayer.rtc || {};

    globalScope.GAME_EDUKASI_CONFIG = {
        ...current,
        multiplayer: {
            prefix: typeof currentMultiplayer.prefix === 'string' && currentMultiplayer.prefix.trim()
                ? currentMultiplayer.prefix.trim()
                : 'infolab_',
            signaling: {
                // Contoh: game-edukasi-peer.onrender.com
                host: typeof currentSignaling.host === 'string' ? currentSignaling.host : '',
                path: typeof currentSignaling.path === 'string' && currentSignaling.path.trim()
                    ? currentSignaling.path
                    : '/peerjs',
                secure: typeof currentSignaling.secure === 'boolean' ? currentSignaling.secure : true,
                port: Number.isInteger(Number(currentSignaling.port)) ? Number(currentSignaling.port) : 443
            },
            rtc: {
                iceServers: Array.isArray(currentRtc.iceServers) && currentRtc.iceServers.length > 0
                    ? currentRtc.iceServers
                    : [
                        { urls: 'stun:stun.l.google.com:19302' }
                        // Tambahkan TURN contoh:
                        // {
                        //   urls: ['turn:global.relay.metered.ca:80?transport=tcp'],
                        //   username: 'TURN_USERNAME',
                        //   credential: 'TURN_CREDENTIAL'
                        // }
                    ]
            }
        }
    };
})(typeof window !== 'undefined' ? window : globalThis);
