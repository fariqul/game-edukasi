/**
 * Rule helpers khusus evaluasi jalur rangkaian.
 */
(function (globalScope) {
    function pathComponentIds(pathEdges) {
        const ids = new Set();
        pathEdges.forEach(edge => {
            if (edge && edge.compId) ids.add(edge.compId);
        });
        return ids;
    }

    function hasUnsafeLedBypass(paths, ledIds, resistorIds) {
        const ledSet = new Set(ledIds);
        const resistorSet = new Set(resistorIds);

        return paths.some(path => {
            const ids = pathComponentIds(path);
            const hasLed = [...ledSet].some(id => ids.has(id));
            const hasResistor = [...resistorSet].some(id => ids.has(id));
            return hasLed && !hasResistor;
        });
    }

    function hasDistinctSingleLedPaths(paths, ledIds) {
        const ledSet = new Set(ledIds);
        for (const ledId of ledSet) {
            const ok = paths.some(path => {
                const ids = pathComponentIds(path);
                if (!ids.has(ledId)) return false;
                let ledCountInPath = 0;
                for (const id of ids) {
                    if (ledSet.has(id)) ledCountInPath++;
                }
                return ledCountInPath === 1;
            });
            if (!ok) return false;
        }
        return true;
    }

    const api = {
        pathComponentIds,
        hasUnsafeLedBypass,
        hasDistinctSingleLedPaths
    };

    globalScope.CircuitRules = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
