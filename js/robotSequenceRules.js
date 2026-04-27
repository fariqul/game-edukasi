/**
 * Rule helpers untuk sequence command Robot mode.
 */
(function (globalScope) {
    function expandRobotSequenceWithTrace(sequence) {
        const expanded = [];
        const trace = [];

        for (let i = 0; i < sequence.length; i++) {
            const cmd = sequence[i];
            if (cmd !== 'loop') {
                expanded.push(cmd);
                trace.push(i);
                continue;
            }

            const c1 = sequence[i + 1];
            const c2 = sequence[i + 2];
            if (!c1 || !c2) {
                return {
                    ok: false,
                    error: 'Loop perlu 2 perintah setelah blok loop.'
                };
            }

            expanded.push(c1, c2, c1, c2);
            trace.push(i + 1, i + 2, i + 1, i + 2);
            i += 2;
        }

        return { ok: true, expanded, trace };
    }

    function expandRobotSequence(sequence) {
        const result = expandRobotSequenceWithTrace(sequence);
        if (!result.ok) {
            return { ok: false, error: result.error };
        }
        return { ok: true, expanded: result.expanded };
    }

    const api = { expandRobotSequence, expandRobotSequenceWithTrace };
    globalScope.RobotSequenceRules = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
