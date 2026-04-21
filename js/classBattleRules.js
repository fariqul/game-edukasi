/**
 * Rule helpers untuk class battle guest.
 */
(function (globalScope) {
    function toSafeNumber(value, fallback) {
        const num = Number(value);
        return Number.isFinite(num) ? num : fallback;
    }

    function normalizeName(rawName) {
        return String(rawName || '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function computeClassBattleScore({ reachedLevel, targetLevel, elapsedMs }) {
        const safeTarget = Math.max(1, Math.floor(toSafeNumber(targetLevel, 1)));
        const safeReached = Math.max(0, Math.floor(toSafeNumber(reachedLevel, 0)));
        const safeElapsed = Math.max(0, Math.floor(toSafeNumber(elapsedMs, 0)));

        const levelPoints = Math.min(safeReached, safeTarget) * 100;
        const speedBonus = Math.max(0, 1000 - Math.floor(safeElapsed / 1000));
        return levelPoints + speedBonus;
    }

    function rankSubmissions(rows) {
        const list = Array.isArray(rows) ? rows : [];
        return [...list].sort((a, b) => {
            const aScore = toSafeNumber(a && a.score, 0);
            const bScore = toSafeNumber(b && b.score, 0);
            if (bScore !== aScore) return bScore - aScore;

            const aTime = Math.max(0, toSafeNumber(a && (a.timeMs ?? a.time_ms), Number.MAX_SAFE_INTEGER));
            const bTime = Math.max(0, toSafeNumber(b && (b.timeMs ?? b.time_ms), Number.MAX_SAFE_INTEGER));
            if (aTime !== bTime) return aTime - bTime;

            const aSubmittedAt = new Date(a && (a.submittedAt ?? a.submitted_at)).getTime();
            const bSubmittedAt = new Date(b && (b.submittedAt ?? b.submitted_at)).getTime();
            return aSubmittedAt - bSubmittedAt;
        });
    }

    function resolveDuplicateDisplayName(existingNames, rawName) {
        const normalizedBase = normalizeName(rawName);
        const base = normalizedBase || 'Peserta';
        const normalized = base.toLowerCase();

        const set = existingNames instanceof Set
            ? existingNames
            : new Set(Array.isArray(existingNames) ? existingNames : []);

        let suffix = 1;
        while (set.has(`${normalized}#${suffix}`) || (suffix === 1 && set.has(normalized))) {
            suffix += 1;
        }

        return {
            displayName: suffix === 1 ? base : `${base} #${suffix}`,
            normalized,
            suffix
        };
    }

    function shouldLockSubmission({ status, firstFinishStartedAt, countdownSeconds, nowMs }) {
        if (status === 'finished' || status === 'cancelled') return true;
        if (!firstFinishStartedAt) return false;

        const startedAtMs = typeof firstFinishStartedAt === 'number'
            ? firstFinishStartedAt
            : new Date(firstFinishStartedAt).getTime();

        if (!Number.isFinite(startedAtMs)) return false;

        const safeCountdown = Math.max(1, Math.floor(toSafeNumber(countdownSeconds, 10)));
        const now = Number.isFinite(nowMs) ? nowMs : Date.now();
        return now >= startedAtMs + safeCountdown * 1000;
    }

    const api = {
        computeClassBattleScore,
        rankSubmissions,
        resolveDuplicateDisplayName,
        shouldLockSubmission
    };

    globalScope.ClassBattleRules = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
