const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

test('circuit components and tooltip layering stay visual', () => {
    const circuitJs = read(path.join('js', 'circuit.js'));
    const indexHtml = read('index.html');

    const bannedCircuitTextIcons = [
        /emoji:\s*'Baterai'/,
        /emoji:\s*'Simulasi'/,
        /emoji:\s*'Hint'/,
        /emoji:\s*'Resistor'/,
        /emoji:\s*'Buzzer'/
    ];

    const missingLayeringFixes = [
        /<div class="lg:col-span-1">/,
        /<div class="lg:col-span-3">/
    ];

    const foundTextIcons = bannedCircuitTextIcons.filter((re) => re.test(circuitJs)).map((re) => re.toString());
    const missingLayers = missingLayeringFixes.filter((re) => re.test(indexHtml)).map((re) => re.toString());

    assert.deepEqual(foundTextIcons, [], `Circuit uses text-icons: ${foundTextIcons.join(', ')}`);
    assert.deepEqual(missingLayers, [], `Circuit layering not fixed: ${missingLayers.join(', ')}`);
});

