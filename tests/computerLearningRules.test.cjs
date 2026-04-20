const test = require('node:test');
const assert = require('node:assert/strict');
const {
    getComponentZone,
    getSlotDisplayName,
    buildWrongPlacementHints
} = require('../js/computerLearningRules.js');

test('getComponentZone mengelompokkan peripheral sebagai external', () => {
    assert.equal(getComponentZone('cpu'), 'motherboard');
    assert.equal(getComponentZone('psu'), 'case');
    assert.equal(getComponentZone('keyboard'), 'external');
    assert.equal(getComponentZone('monitor'), 'external');
});

test('getSlotDisplayName memberi nama slot edukatif', () => {
    assert.equal(getSlotDisplayName('cpu').toLowerCase().includes('cpu'), true);
    assert.equal(getSlotDisplayName('ram').toLowerCase().includes('ram'), true);
    assert.equal(getSlotDisplayName('unknown-slot'), 'unknown-slot');
});

test('buildWrongPlacementHints menghasilkan daftar kesalahan yang bisa dipelajari', () => {
    const placed = {
        cpu: { type: 'ram', correct: false },
        storage: { type: 'gpu', correct: false }
    };
    const hints = buildWrongPlacementHints(placed);
    assert.equal(hints.length, 2);
    assert.match(hints[0], /RAM|CPU/i);
});
