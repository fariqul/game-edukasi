const test = require('node:test');
const assert = require('node:assert/strict');
const {
    shouldShowExpectedOutput,
    normalizeComparableText,
    isExactTopologyMatch
} = require('../js/gameLogicRules.js');

test('shouldShowExpectedOutput: tipe guess harus disembunyikan', () => {
    assert.equal(shouldShowExpectedOutput('guess'), false);
    assert.equal(shouldShowExpectedOutput('fill'), true);
});

test('normalizeComparableText: normalisasi spasi aman', () => {
    assert.equal(normalizeComparableText('  a   +   b  '), 'a + b');
    assert.equal(normalizeComparableText('\nhello\tworld\n'), 'hello world');
});

test('isExactTopologyMatch: gagal bila ada koneksi ekstra', () => {
    const required = [['pc', 'switch'], ['switch', 'server']];
    const connectedWithExtra = [['pc', 'switch'], ['switch', 'server'], ['pc', 'server']];
    const connectedExact = [['switch', 'server'], ['pc', 'switch']];

    assert.equal(isExactTopologyMatch(connectedWithExtra, required), false);
    assert.equal(isExactTopologyMatch(connectedExact, required), true);
});
