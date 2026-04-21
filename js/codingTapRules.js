/**
 * Rule helpers untuk interaksi tap pada puzzle coding.
 */
(function (globalScope) {
    function findFirstEmptySlotIndex(slotIndexes, userAnswers) {
        if (!Array.isArray(slotIndexes)) return null;
        const answers = userAnswers && typeof userAnswers === 'object' ? userAnswers : {};

        for (const slotIndex of slotIndexes) {
            const key = String(slotIndex);
            const value = answers[key];
            if (typeof value !== 'string' || value.trim() === '') {
                return key;
            }
        }
        return null;
    }

    const api = { findFirstEmptySlotIndex };
    globalScope.CodingTapRules = api;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
