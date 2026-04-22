const test = require('node:test');
const assert = require('node:assert/strict');
const {
    pathComponentIds,
    hasUnsafeLedBypass,
    hasDistinctSingleLedPaths
} = require('../js/circuitRules.js');

test('pathComponentIds mengekstrak komponen unik dari path', () => {
    const ids = pathComponentIds([
        { compId: null },
        { compId: 'led1' },
        { compId: 'res1' },
        { compId: 'led1' }
    ]);
    assert.deepEqual([...ids].sort(), ['led1', 'res1']);
});

test('hasUnsafeLedBypass mendeteksi jalur LED tanpa resistor', () => {
    const paths = [
        [{ compId: 'led1' }, { compId: 'res1' }],
        [{ compId: 'led1' }]
    ];
    assert.equal(hasUnsafeLedBypass(paths, ['led1'], ['res1']), true);
});

test('hasDistinctSingleLedPaths valid untuk paralel dan gagal untuk seri', () => {
    const parallelPaths = [
        [{ compId: 'led1' }],
        [{ compId: 'led2' }]
    ];
    const seriesPath = [
        [{ compId: 'led1' }, { compId: 'led2' }]
    ];

    assert.equal(hasDistinctSingleLedPaths(parallelPaths, ['led1', 'led2']), true);
    assert.equal(hasDistinctSingleLedPaths(seriesPath, ['led1', 'led2']), false);
});
