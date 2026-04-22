/**
 * Runtime state helpers untuk class battle guest.
 */
(function (globalScope) {
    function createInitialState() {
        return {
            sessionId: null,
            sessionCode: '',
            role: 'guest',
            status: 'idle',
            mode: '',
            targetLevel: 1,
            hostToken: '',
            participantId: null,
            participantToken: '',
            displayName: '',
            countdownStartedAt: null,
            countdownSeconds: 10,
            countdownLeft: 10,
            locked: false
        };
    }

    function setSession(state, payload) {
        if (!state || !payload) return state;
        state.sessionId = payload.sessionId ?? state.sessionId;
        state.sessionCode = payload.sessionCode ?? state.sessionCode;
        state.role = payload.role ?? state.role;
        state.status = payload.status ?? state.status;
        state.mode = payload.mode ?? state.mode;
        state.targetLevel = payload.targetLevel ?? state.targetLevel;
        state.hostToken = payload.hostToken ?? state.hostToken;
        state.participantId = payload.participantId ?? state.participantId;
        state.participantToken = payload.participantToken ?? state.participantToken;
        state.displayName = payload.displayName ?? state.displayName;
        if (state.status === 'finished' || state.status === 'cancelled') {
            state.locked = true;
            state.countdownLeft = 0;
        }
        return state;
    }

    function setStatus(state, status) {
        if (!state) return state;
        state.status = status;
        if (status === 'finished' || status === 'cancelled') {
            state.locked = true;
            state.countdownLeft = 0;
        }
        return state;
    }

    function startCountdown(state, seconds, startedAtMs) {
        if (!state) return state;
        const safeSeconds = Math.max(1, Math.floor(Number(seconds) || 10));
        state.countdownSeconds = safeSeconds;
        state.countdownStartedAt = Number.isFinite(startedAtMs)
            ? startedAtMs
            : Date.now();
        state.countdownLeft = safeSeconds;
        state.locked = false;
        return state;
    }

    function tickCountdown(state, nowMs) {
        if (!state || !state.countdownStartedAt || state.locked) return state;

        const now = Number.isFinite(nowMs) ? nowMs : Date.now();
        const elapsed = Math.floor((now - state.countdownStartedAt) / 1000);
        state.countdownLeft = Math.max(0, state.countdownSeconds - elapsed);

        if (state.countdownLeft === 0) {
            state.locked = true;
        }
        return state;
    }

    function lockSubmissions(state) {
        if (!state) return state;
        state.locked = true;
        state.countdownLeft = 0;
        return state;
    }

    function clearState(state) {
        if (!state) return createInitialState();
        return Object.assign(state, createInitialState());
    }

    const api = {
        createInitialState,
        setSession,
        setStatus,
        startCountdown,
        tickCountdown,
        lockSubmissions,
        clearState
    };

    globalScope.ClassBattleState = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
