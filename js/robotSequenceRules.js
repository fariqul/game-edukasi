/**
 * Rule helpers untuk sequence command Robot mode.
 */
(function (globalScope) {
    function expandRobotSequence(sequence) {
        const expanded = [];
        for (let i = 0; i < sequence.length; i++) {
            const cmd = sequence[i];
            if (cmd !== 'loop') {
                expanded.push(cmd);
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
            i += 2;
        }

        return { ok: true, expanded };
    }

    const api = { expandRobotSequence };
    globalScope.RobotSequenceRules = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
