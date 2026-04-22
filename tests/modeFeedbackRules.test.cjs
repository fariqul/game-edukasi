const test = require('node:test');
const assert = require('node:assert/strict');
const {
    getRobotFailureMessage,
    formatNetworkPathSummary,
    getCodingGuessMessage
} = require('../js/modeFeedbackRules.js');

test('getRobotFailureMessage memuat sebab crash dan step', () => {
    const msg = getRobotFailureMessage({
        robotName: 'Robot Biru',
        crashCount: 2,
        reason: 'wall',
        stepIndex: 3,
        totalSteps: 8
    });
    assert.match(msg, /Robot Biru/);
    assert.match(msg, /tembok|rintangan/i);
    assert.match(msg, /4\/8/);
});

test('formatNetworkPathSummary merangkum rute data', () => {
    const summary = formatNetworkPathSummary([{ type: 'pc' }, { type: 'switch' }, { type: 'server' }]);
    assert.equal(summary, 'PC -> SWITCH -> SERVER');
});

test('getCodingGuessMessage memberi arahan saat belum memilih', () => {
    const msg = getCodingGuessMessage(null, 'Loop');
    assert.match(msg, /Pilih salah satu jawaban/i);
    assert.match(msg, /Loop/);
});
