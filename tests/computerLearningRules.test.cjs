const test = require('node:test');
const assert = require('node:assert/strict');
const {
    getComponentZone,
    getZoneLabel,
    getSlotDisplayName,
    analyzePlacementIssues,
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

test('analyzePlacementIssues memisahkan salah zona dan salah slot', () => {
    const placed = {
        cpu: { type: 'keyboard', correct: false },
        ram: { type: 'cpu', correct: false },
        psu: { type: 'psu', correct: true }
    };

    const issues = analyzePlacementIssues(placed);
    assert.equal(issues.zoneMismatch.length, 1);
    assert.equal(issues.slotMismatch.length, 1);
    assert.equal(getZoneLabel('external').includes('external'), true);
});

test('buildWrongPlacementHints menghasilkan daftar kesalahan yang bisa dipelajari', () => {
    const placed = {
        cpu: { type: 'ram', correct: false },
        storage: { type: 'gpu', correct: false }
    };
    const hints = buildWrongPlacementHints(placed);
    assert.equal(hints.length, 2);
    assert.equal(hints.some((h) => /RAM|CPU/i.test(h)), true);
});
