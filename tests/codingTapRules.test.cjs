const test = require('node:test');
const assert = require('node:assert/strict');
const {
    findFirstEmptySlotIndex
} = require('../js/codingTapRules.js');

test('findFirstEmptySlotIndex: pilih slot kosong pertama', () => {
    const slotIndexes = ['1', '3', '4'];
    const userAnswers = { 3: 'range(1,4)' };
    assert.equal(findFirstEmptySlotIndex(slotIndexes, userAnswers), '1');
});

test('findFirstEmptySlotIndex: null jika semua slot terisi', () => {
    const slotIndexes = ['0', '2'];
    const userAnswers = { 0: 'def', 2: '()' };
    assert.equal(findFirstEmptySlotIndex(slotIndexes, userAnswers), null);
});
