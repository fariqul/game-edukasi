const test = require('node:test');
const assert = require('node:assert/strict');
const {
    evaluateFillAnswers,
    evaluateSortAnswers,
    explainTopologyDiff
} = require('../js/learningRules.js');

test('evaluateFillAnswers mengembalikan baris salah pertama', () => {
    const code = [
        { slot: true, answer: '10' },
        { text: 'print(x)' },
        { slot: true, answer: '20' }
    ];
    const result = evaluateFillAnswers(code, { 0: '10', 2: '2' }, (v) => String(v).trim());
    assert.equal(result.ok, false);
    assert.equal(result.firstWrongLine, 3);
});

test('evaluateSortAnswers mendeteksi index salah pertama', () => {
    const result = evaluateSortAnswers(['a', 'c', 'b'], ['a', 'b', 'c']);
    assert.equal(result.ok, false);
    assert.equal(result.firstWrongIndex, 2);
});

test('explainTopologyDiff melaporkan missing dan extra pair', () => {
    const required = [['pc', 'switch'], ['switch', 'server']];
    const connected = [['pc', 'switch'], ['pc', 'server']];
    const diff = explainTopologyDiff(connected, required);
    assert.equal(diff.exact, false);
    assert.deepEqual(diff.missing, ['server-switch']);
    assert.deepEqual(diff.extra, ['pc-server']);
});
