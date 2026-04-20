/**
 * Rule helpers untuk stabilitas koneksi Multiplayer.
 */
(function (globalScope) {
    function mapPeerErrorMessage(errorType, isHost) {
        switch (errorType) {
            case 'peer-unavailable':
                return 'Room tidak ditemukan atau lawan offline.';
            case 'network':
                return 'Koneksi jaringan bermasalah. Coba lagi.';
            case 'browser-incompatible':
                return 'Browser tidak mendukung WebRTC.';
            case 'invalid-id':
                return 'ID room tidak valid.';
            case 'unavailable-id':
                return isHost ? 'PIN bentrok, sistem membuat PIN baru.' : 'ID room sedang dipakai.';
            case 'webrtc':
                return 'Koneksi realtime gagal. Coba ulangi.';
            default:
                return 'Terjadi error koneksi multiplayer.';
        }
    }

    function shouldAttemptReconnect(peerInstance) {
        return Boolean(peerInstance && peerInstance.disconnected && !peerInstance.destroyed);
    }

    const api = {
        mapPeerErrorMessage,
        shouldAttemptReconnect
    };

    globalScope.MultiplayerRules = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
