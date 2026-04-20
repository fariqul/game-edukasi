/**
 * Helpers untuk evaluasi jawaban dan feedback edukatif lintas mode.
 */
(function (globalScope) {
    function evaluateFillAnswers(codeLines, userAnswers, normalizeFn) {
        const normalize = normalizeFn || ((v) => String(v ?? '').replace(/\s+/g, ' ').trim());
        for (let i = 0; i < codeLines.length; i++) {
            const line = codeLines[i];
            if (!line.slot) continue;
            const actual = normalize(userAnswers[i]);
            const expected = normalize(line.answer);
            if (actual !== expected) {
                return { ok: false, firstWrongLine: i + 1 };
            }
        }
        return { ok: true };
    }

    function evaluateSortAnswers(actual, expected) {
        if (actual.length !== expected.length) {
            return { ok: false, firstWrongIndex: Math.min(actual.length, expected.length) + 1 };
        }
        for (let i = 0; i < expected.length; i++) {
            if (actual[i] !== expected[i]) {
                return { ok: false, firstWrongIndex: i + 1 };
            }
        }
        return { ok: true };
    }

    function pairKey(pair) {
        return [...pair].sort().join('-');
    }

    function multisetCount(pairs) {
        const map = new Map();
        pairs.forEach(pair => {
            const key = pairKey(pair);
            map.set(key, (map.get(key) || 0) + 1);
        });
        return map;
    }

    function expandCountMap(map) {
        const list = [];
        for (const [key, count] of map.entries()) {
            for (let i = 0; i < count; i++) list.push(key);
        }
        return list.sort();
    }

    function explainTopologyDiff(connectedPairs, requiredPairs) {
        const connected = multisetCount(connectedPairs || []);
        const required = multisetCount(requiredPairs || []);

        const missing = new Map();
        const extra = new Map();

        const keys = new Set([...connected.keys(), ...required.keys()]);
        keys.forEach(key => {
            const c = connected.get(key) || 0;
            const r = required.get(key) || 0;
            if (r > c) missing.set(key, r - c);
            if (c > r) extra.set(key, c - r);
        });

        return {
            exact: missing.size === 0 && extra.size === 0,
            missing: expandCountMap(missing),
            extra: expandCountMap(extra)
        };
    }

    const api = { evaluateFillAnswers, evaluateSortAnswers, explainTopologyDiff };
    globalScope.LearningRules = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
