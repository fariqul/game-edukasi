/**
 * Rule helpers untuk analitik mode Robot Logic.
 */
(function (globalScope) {
    const VERSION = 1;

    function clampInt(value) {
        const n = Number(value);
        if (!Number.isFinite(n) || n < 0) return 0;
        return Math.floor(n);
    }

    function clampPercent(value) {
        const n = Number(value);
        if (!Number.isFinite(n) || n < 0) return 0;
        return Math.min(100, Math.round(n));
    }

    function createLevelEntry() {
        return {
            attempts: 0,
            successes: 0,
            minCommands: 0,
            lastCommands: 0,
            bestCommands: 0,
            bestEfficiency: 0,
            lastFailureReason: ''
        };
    }

    function createRobotAnalyticsState() {
        return {
            version: VERSION,
            totalAttempts: 0,
            totalSuccesses: 0,
            totalFailures: 0,
            failureByReason: {
                out: 0,
                wall: 0,
                other: 0
            },
            levels: {}
        };
    }

    function normalizeLevelEntry(entry) {
        const base = createLevelEntry();
        if (!entry || typeof entry !== 'object') return base;

        base.attempts = clampInt(entry.attempts);
        base.successes = clampInt(entry.successes);
        base.minCommands = clampInt(entry.minCommands);
        base.lastCommands = clampInt(entry.lastCommands);
        base.bestCommands = clampInt(entry.bestCommands);
        base.bestEfficiency = clampPercent(entry.bestEfficiency);
        base.lastFailureReason = typeof entry.lastFailureReason === 'string'
            ? entry.lastFailureReason
            : '';

        return base;
    }

    function normalizeRobotAnalytics(input) {
        const base = createRobotAnalyticsState();
        if (!input || typeof input !== 'object') return base;

        base.totalAttempts = clampInt(input.totalAttempts);
        base.totalSuccesses = clampInt(input.totalSuccesses);
        base.totalFailures = clampInt(input.totalFailures);

        const byReason = input.failureByReason || {};
        base.failureByReason.out = clampInt(byReason.out);
        base.failureByReason.wall = clampInt(byReason.wall);
        base.failureByReason.other = clampInt(byReason.other);

        const levels = input.levels;
        if (levels && typeof levels === 'object') {
            Object.keys(levels).forEach((levelId) => {
                if (!/^\d+$/.test(levelId)) return;
                base.levels[levelId] = normalizeLevelEntry(levels[levelId]);
            });
        }

        return base;
    }

    function computeEfficiency(commandsUsed, minCommands) {
        const safeCommands = clampInt(commandsUsed);
        if (!safeCommands) return 0;

        const safeMin = clampInt(minCommands);
        if (!safeMin) return 100;

        return clampPercent((safeMin / safeCommands) * 100);
    }

    function getFailureReasonKey(reason) {
        if (reason === 'out' || reason === 'wall') return reason;
        return 'other';
    }

    function ensureLevelEntry(state, levelId, minCommands) {
        const key = String(clampInt(levelId));
        if (!key || key === '0') return null;

        if (!state.levels[key]) {
            state.levels[key] = createLevelEntry();
        }

        if (clampInt(minCommands) > 0) {
            state.levels[key].minCommands = clampInt(minCommands);
        }

        return state.levels[key];
    }

    function recordRobotAttempt(state, levelId, minCommands) {
        const next = normalizeRobotAnalytics(state);
        next.totalAttempts += 1;
        const level = ensureLevelEntry(next, levelId, minCommands);
        if (level) {
            level.attempts += 1;
        }
        return next;
    }

    function recordRobotFailure(state, levelId, reason) {
        const next = normalizeRobotAnalytics(state);
        next.totalFailures += 1;
        const reasonKey = getFailureReasonKey(reason);
        next.failureByReason[reasonKey] += 1;

        const level = ensureLevelEntry(next, levelId, 0);
        if (level) {
            level.lastFailureReason = reasonKey;
        }

        return next;
    }

    function recordRobotSuccess(state, levelId, commandsUsed, minCommands) {
        const next = normalizeRobotAnalytics(state);
        next.totalSuccesses += 1;

        const level = ensureLevelEntry(next, levelId, minCommands);
        if (level) {
            const safeCommands = clampInt(commandsUsed);
            level.successes += 1;
            level.lastCommands = safeCommands;
            const efficiency = computeEfficiency(safeCommands, level.minCommands);
            if (efficiency >= level.bestEfficiency) {
                level.bestEfficiency = efficiency;
                level.bestCommands = safeCommands;
            }
        }

        return next;
    }

    function summarizeRobotAnalytics(state, limit) {
        const safe = normalizeRobotAnalytics(state);
        const maxItems = clampInt(limit) || 3;

        const levelSummaries = Object.keys(safe.levels)
            .map((levelId) => ({
                levelId: clampInt(levelId),
                ...safe.levels[levelId]
            }))
            .sort((a, b) => {
                if (b.attempts !== a.attempts) return b.attempts - a.attempts;
                return a.levelId - b.levelId;
            })
            .slice(0, maxItems);

        const efficiencySamples = Object.values(safe.levels)
            .map((entry) => clampPercent(entry.bestEfficiency))
            .filter((score) => score > 0);

        const overallEfficiency = efficiencySamples.length
            ? clampPercent(efficiencySamples.reduce((sum, score) => sum + score, 0) / efficiencySamples.length)
            : 0;

        return {
            totalAttempts: safe.totalAttempts,
            totalSuccesses: safe.totalSuccesses,
            totalFailures: safe.totalFailures,
            failuresOut: safe.failureByReason.out,
            failuresWall: safe.failureByReason.wall,
            failuresOther: safe.failureByReason.other,
            overallEfficiency,
            levelSummaries
        };
    }

    const api = {
        createRobotAnalyticsState,
        normalizeRobotAnalytics,
        computeEfficiency,
        recordRobotAttempt,
        recordRobotFailure,
        recordRobotSuccess,
        summarizeRobotAnalytics
    };

    globalScope.RobotAnalyticsRules = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
