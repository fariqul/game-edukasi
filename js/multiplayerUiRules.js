/**
 * Rule helpers untuk visibilitas overlay multiplayer.
 */
(function (globalScope) {
    function shouldShowGuestWaitingOverlay({ active, isHost, currentScreen }) {
        return Boolean(active) && !Boolean(isHost) && currentScreen === 'dashboard';
    }

    const api = { shouldShowGuestWaitingOverlay };
    globalScope.MultiplayerUiRules = api;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
