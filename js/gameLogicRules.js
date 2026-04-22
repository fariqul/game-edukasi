/**
 * Shared rule helpers untuk validasi logika mode game.
 */
(function (globalScope) {
    function shouldShowExpectedOutput(puzzleType) {
        return puzzleType !== 'guess';
    }

    function normalizeComparableText(value) {
        return String(value ?? '')
            .replace(/\s+/g, ' ')
            .trim();
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

    function isExactTopologyMatch(connectedPairs, requiredPairs) {
        if (!Array.isArray(connectedPairs) || !Array.isArray(requiredPairs)) return false;
        if (connectedPairs.length !== requiredPairs.length) return false;

        const connected = multisetCount(connectedPairs);
        const required = multisetCount(requiredPairs);
        if (connected.size !== required.size) return false;

        for (const [key, count] of required.entries()) {
            if ((connected.get(key) || 0) !== count) return false;
        }
        return true;
    }

    const api = {
        shouldShowExpectedOutput,
        normalizeComparableText,
        isExactTopologyMatch
    };

    globalScope.GameLogicRules = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
