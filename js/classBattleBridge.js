/**
 * Bridge antara UI multiplayer/main dengan class battle service.
 */
(function (globalScope) {
    function loadStateApi(globalRef) {
        if (globalRef && globalRef.ClassBattleState) return globalRef.ClassBattleState;
        if (typeof require === 'function') {
            try {
                return require('./classBattleState.js');
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    function loadRulesApi(globalRef) {
        if (globalRef && globalRef.ClassBattleRules) return globalRef.ClassBattleRules;
        if (typeof require === 'function') {
            try {
                return require('./classBattleRules.js');
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    const stateApi = loadStateApi(globalScope) || {
        createInitialState() {
            return {
                sessionId: null,
                sessionCode: '',
                role: 'guest',
                status: 'idle',
                mode: '',
                targetLevel: 1,
                participantId: null,
                countdownStartedAt: null,
                countdownSeconds: 10,
                countdownLeft: 10,
                locked: false
            };
        },
        setSession(state, payload) { return Object.assign(state, payload || {}); },
        setStatus(state, status) { state.status = status; return state; },
        startCountdown(state, seconds, startedAtMs) {
            state.countdownSeconds = seconds;
            state.countdownStartedAt = startedAtMs;
            state.countdownLeft = seconds;
            state.locked = false;
            return state;
        },
        tickCountdown(state, nowMs) {
            if (!state.countdownStartedAt || state.locked) return state;
            const elapsed = Math.floor((nowMs - state.countdownStartedAt) / 1000);
            state.countdownLeft = Math.max(0, state.countdownSeconds - elapsed);
            if (state.countdownLeft === 0) state.locked = true;
            return state;
        }
    };

    const rulesApi = loadRulesApi(globalScope) || {
        computeClassBattleScore() { return 0; }
    };

    function createBridge(options) {
        const opt = options && typeof options === 'object' ? options : {};
        const service = opt.service || null;
        const state = opt.state || stateApi.createInitialState();
        const nowFn = typeof opt.nowFn === 'function' ? opt.nowFn : () => Date.now();
        const pollIntervalMs = Math.max(1000, Math.floor(Number(opt.pollIntervalMs) || 2000));

        let firstFinishTriggered = false;
        let countdownTimer = null;
        let rankingTimer = null;
        let channel = null;

        function safeCall(cb, ...args) {
            if (typeof cb !== 'function') return;
            try {
                cb(...args);
            } catch (error) {
                console.warn('ClassBattleBridge callback error:', error);
            }
        }

        function stopCountdownTicker() {
            if (!countdownTimer) return;
            clearInterval(countdownTimer);
            countdownTimer = null;
        }

        function stopRankingPolling() {
            if (!rankingTimer) return;
            clearInterval(rankingTimer);
            rankingTimer = null;
        }

        function tickCountdown(nowMs) {
            const nextState = stateApi.tickCountdown(state, Number.isFinite(nowMs) ? nowMs : nowFn());
            safeCall(opt.onCountdownTick, nextState.countdownLeft, nextState);

            if (nextState.locked) {
                stopCountdownTicker();
                safeCall(opt.onSessionLocked, nextState);
            }
            return nextState;
        }

        function startCountdownTicker() {
            stopCountdownTicker();
            countdownTimer = setInterval(() => {
                tickCountdown(nowFn());
            }, 250);
        }

        function applyCountdownFromServer(startedAt, seconds) {
            const startedAtMs = typeof startedAt === 'number'
                ? startedAt
                : new Date(startedAt).getTime();

            if (!Number.isFinite(startedAtMs)) return state;

            stateApi.startCountdown(state, Math.max(1, Math.floor(Number(seconds) || 10)), startedAtMs);
            startCountdownTicker();
            safeCall(opt.onStartCountdown, state.countdownSeconds, state);
            return state;
        }

        async function refreshRanking() {
            if (!service || typeof service.fetchRanking !== 'function' || !state.sessionId) {
                return [];
            }
            const ranking = await service.fetchRanking({ sessionId: state.sessionId, limit: 30 });
            safeCall(opt.onRankingUpdated, ranking);
            return ranking;
        }

        function startRankingPolling() {
            stopRankingPolling();
            rankingTimer = setInterval(() => {
                refreshRanking().catch((error) => safeCall(opt.onError, error));
            }, pollIntervalMs);
        }

        function handleRealtimeEvent(eventName, payload) {
            switch (eventName) {
                case 'session-started':
                    stateApi.setStatus(state, 'in_progress');
                    break;
                case 'first-finish-window-started':
                    applyCountdownFromServer(payload && payload.startedAt, payload && payload.seconds);
                    break;
                case 'session-finished':
                    stateApi.setStatus(state, (payload && payload.status) || 'finished');
                    stopCountdownTicker();
                    stopRankingPolling();
                    safeCall(opt.onSessionLocked, state);
                    break;
                case 'ranking-updated':
                    refreshRanking().catch((error) => safeCall(opt.onError, error));
                    break;
            }
            safeCall(opt.onEvent, eventName, payload, state);
        }

        async function connectRealtime(sessionCode) {
            if (!service || typeof service.createSessionChannel !== 'function') return null;

            if (channel && typeof service.removeSessionChannel === 'function') {
                await service.removeSessionChannel(channel);
            }

            channel = service.createSessionChannel(sessionCode, {
                onBroadcast: handleRealtimeEvent,
                onStatus(status) {
                    safeCall(opt.onStatus, status);
                    if (status === 'SUBSCRIBED') {
                        stopRankingPolling();
                        refreshRanking().catch((error) => safeCall(opt.onError, error));
                        return;
                    }
                    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                        startRankingPolling();
                    }
                }
            });

            return channel;
        }

        async function broadcast(eventName, payload) {
            if (!service || typeof service.sendSessionEvent !== 'function') return null;
            return service.sendSessionEvent(channel, eventName, payload || {});
        }

        function onFirstFinish() {
            if (firstFinishTriggered) return false;
            firstFinishTriggered = true;
            stateApi.startCountdown(state, state.countdownSeconds || 10, nowFn());
            safeCall(opt.onStartCountdown, state.countdownSeconds, state);
            startCountdownTicker();
            return true;
        }

        async function submitCompletion({ reachedLevel, targetLevel, elapsedMs, participantId }) {
            if (!service || typeof service.submitResultWithRetry !== 'function') return null;
            const score = rulesApi.computeClassBattleScore({
                reachedLevel,
                targetLevel: Number(targetLevel) || state.targetLevel,
                elapsedMs
            });
            return service.submitResultWithRetry({
                sessionId: state.sessionId,
                participantId: participantId || state.participantId,
                reachedLevel,
                score,
                timeMs: elapsedMs
            });
        }

        function syncSessionMeta({ session, participant, role }) {
            stateApi.setSession(state, {
                sessionId: session && session.id,
                sessionCode: session && session.session_code,
                role: role || (participant && participant.is_host ? 'host' : 'guest'),
                status: (session && session.status) || state.status,
                mode: (session && session.mode) || state.mode,
                targetLevel: (session && session.target_level) || state.targetLevel,
                hostToken: (session && session.host_token) || state.hostToken,
                participantId: (participant && participant.id) || state.participantId,
                participantToken: (participant && participant.player_token) || state.participantToken,
                displayName: (participant && participant.display_name) || state.displayName
            });

            if (session && session.first_finish_started_at) {
                applyCountdownFromServer(session.first_finish_started_at, session.finish_countdown_seconds);
            }

            return state;
        }

        function resetFirstFinishLock() {
            firstFinishTriggered = false;
        }

        async function dispose() {
            stopCountdownTicker();
            stopRankingPolling();
            if (channel && service && typeof service.removeSessionChannel === 'function') {
                await service.removeSessionChannel(channel);
            }
            channel = null;
        }

        return {
            service,
            state,
            connectRealtime,
            handleRealtimeEvent,
            onFirstFinish,
            resetFirstFinishLock,
            tickCountdown,
            applyCountdownFromServer,
            syncSessionMeta,
            submitCompletion,
            refreshRanking,
            startRankingPolling,
            stopRankingPolling,
            broadcast,
            dispose
        };
    }

    const api = { createBridge };
    globalScope.ClassBattleBridge = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
