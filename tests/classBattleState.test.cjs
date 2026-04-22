const test = require('node:test');
const assert = require('node:assert/strict');
const {
    createInitialState,
    setStatus,
    startCountdown,
    tickCountdown
} = require('../js/classBattleState.js');

test('countdown: dari 10 detik ke 0 lalu lock', () => {
    const st = createInitialState();
    startCountdown(st, 10, 1000);
    tickCountdown(st, 11000);

    assert.equal(st.countdownLeft, 0);
    assert.equal(st.locked, true);
});

test('setStatus: finished langsung lock submission', () => {
    const st = createInitialState();
    setStatus(st, 'finished');

    assert.equal(st.locked, true);
    assert.equal(st.countdownLeft, 0);
});
