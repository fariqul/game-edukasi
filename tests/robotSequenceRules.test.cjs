const test = require('node:test');
const assert = require('node:assert/strict');
const {
    expandRobotSequence,
    expandRobotSequenceWithTrace
} = require('../js/robotSequenceRules.js');

test('expandRobotSequence: loop valid mengulang 2 command berikutnya', () => {
    const result = expandRobotSequence(['forward', 'loop', 'left', 'right', 'forward']);
    assert.equal(result.ok, true);
    assert.deepEqual(result.expanded, ['forward', 'left', 'right', 'left', 'right', 'forward']);
});

test('expandRobotSequence: loop tanpa 2 command ditolak', () => {
    const result = expandRobotSequence(['forward', 'loop', 'left']);
    assert.equal(result.ok, false);
    assert.match(result.error, /Loop perlu 2 perintah/);
});

test('expandRobotSequenceWithTrace: menyimpan indeks sumber untuk highlight eksekusi', () => {
    const result = expandRobotSequenceWithTrace(['forward', 'loop', 'left', 'right', 'forward']);
    assert.equal(result.ok, true);
    assert.deepEqual(result.expanded, ['forward', 'left', 'right', 'left', 'right', 'forward']);
    assert.deepEqual(result.trace, [0, 2, 3, 2, 3, 4]);
});
