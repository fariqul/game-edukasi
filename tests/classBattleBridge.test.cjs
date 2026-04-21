const test = require('node:test');
const assert = require('node:assert/strict');
const { createBridge } = require('../js/classBattleBridge.js');

test('first finisher memulai countdown 10 detik sekali saja', async () => {
    let started = 0;
    const bridge = createBridge({
        onStartCountdown: () => { started += 1; }
    });

    bridge.onFirstFinish();
    bridge.onFirstFinish();

    await bridge.dispose();
    assert.equal(started, 1);
});
