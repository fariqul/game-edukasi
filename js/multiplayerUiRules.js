/**
 * Rule helpers untuk visibilitas overlay multiplayer.
 */
(function (globalScope) {
    const COMPETITIVE_PLAY_SCREENS = new Set(['robot', 'network', 'computer', 'coding', 'circuit']);

    function shouldShowGuestWaitingOverlay({ active, isHost, currentScreen }) {
        return Boolean(active) && !Boolean(isHost) && currentScreen === 'dashboard';
    }

    function shouldEnableFocusPlayUi({ active, currentScreen }) {
        if (!Boolean(active)) return false;
        const screen = String(currentScreen || '').trim().toLowerCase().replace(/-screen$/, '');
        return COMPETITIVE_PLAY_SCREENS.has(screen);
    }

    const api = {
        shouldShowGuestWaitingOverlay,
        shouldEnableFocusPlayUi
    };
    globalScope.MultiplayerUiRules = api;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
