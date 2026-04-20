/**
 * Guard dan normalisasi state game dari localStorage agar tidak corrupt.
 */
(function (globalScope) {
    function toInt(value, fallback) {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        return Math.floor(n);
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function cloneDefaults(defaults) {
        return {
            progress: Object.fromEntries(
                Object.entries(defaults.progress).map(([mode, value]) => [
                    mode,
                    { completed: value.completed, total: value.total }
                ])
            ),
            currentLevel: { ...defaults.currentLevel }
        };
    }

    function normalizeGameState(saved, defaults) {
        const normalized = cloneDefaults(defaults);
        if (!saved || typeof saved !== 'object') {
            return normalized;
        }

        const safeProgress = saved.progress && typeof saved.progress === 'object' ? saved.progress : {};
        const safeCurrentLevel = saved.currentLevel && typeof saved.currentLevel === 'object' ? saved.currentLevel : {};

        for (const mode of Object.keys(defaults.progress)) {
            const total = toInt(defaults.progress[mode].total, 1);
            const savedCompleted = safeProgress[mode] && typeof safeProgress[mode] === 'object'
                ? toInt(safeProgress[mode].completed, 0)
                : 0;
            const savedLevel = toInt(safeCurrentLevel[mode], 1);

            normalized.progress[mode].completed = clamp(savedCompleted, 0, total);
            normalized.currentLevel[mode] = clamp(savedLevel, 1, total);
        }

        return normalized;
    }

    const api = { normalizeGameState };
    globalScope.StateGuards = api;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
