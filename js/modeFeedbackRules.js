/**
 * Helper pesan feedback lintas mode game.
 */
(function (globalScope) {
    function getRobotFailureMessage({ robotName, crashCount, reason, stepIndex, totalSteps }) {
        const reasonText = reason === 'out'
            ? 'keluar grid'
            : reason === 'wall'
                ? 'menabrak tembok/rintangan'
                : 'menabrak obstacle';
        const stepText = Number.isInteger(stepIndex) && Number.isInteger(totalSteps)
            ? ` (langkah ${stepIndex + 1}/${totalSteps})`
            : '';
        const damage = crashCount >= 2 ? 'rusak parah' : 'rusak ringan';
        return `Gagal ${robotName} ${damage} karena ${reasonText}${stepText}.`;
    }

    function formatNetworkPathSummary(path) {
        if (!Array.isArray(path) || path.length === 0) return '';
        return path.map(node => String(node.type || '').toUpperCase()).join(' -> ');
    }

    function getCodingGuessMessage(selectedChoice, concept) {
        if (!selectedChoice) {
            return `Pilih salah satu jawaban dulu. Fokus ke konsep: ${concept}.`;
        }
        return `Jawaban belum tepat. Tinjau lagi konsep: ${concept}.`;
    }

    const api = {
        getRobotFailureMessage,
        formatNetworkPathSummary,
        getCodingGuessMessage
    };
    globalScope.ModeFeedbackRules = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
