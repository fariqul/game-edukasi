const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const circuitPath = path.join(__dirname, '..', 'js', 'circuit.js');

test('circuit control buttons use click listeners (not brittle onclick)', () => {
    const src = fs.readFileSync(circuitPath, 'utf8');

    assert.match(src, /resetBtn\.addEventListener\('click'/, 'reset button listener missing');
    assert.match(src, /deleteBtn\.addEventListener\('click'/, 'delete button listener missing');
    assert.match(src, /wireBtn\.addEventListener\('click'/, 'wire button listener missing');
    assert.match(src, /simBtn\.addEventListener\('click'/, 'simulate button listener missing');
});

