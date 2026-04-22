const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

test('critical UI surfaces use visual icons, not placeholder text', () => {
    const indexHtml = read('index.html');
    const robotJs = read(path.join('js', 'robot.js'));
    const adaptiveHintsJs = read(path.join('js', 'adaptiveHints.js'));

    const bannedPatterns = [
        /mode-icon"\s+style="font-size:3\.5rem;">Koneksi<\/div>/,
        /id="tutorial-icon">Halo<\/div>/,
        /cell\.innerHTML\s*=\s*'Goal';/,
        /cell\.innerHTML\s*=\s*'Block';/,
        /icon\)\s*icon\.textContent\s*=\s*step\.icon;/,
        /\$\{concept\.icon\}/
    ];

    const content = `${indexHtml}\n${robotJs}\n${adaptiveHintsJs}`;
    const found = bannedPatterns.filter((re) => re.test(content)).map((re) => re.toString());

    assert.deepEqual(found, [], `Found text-icon regressions: ${found.join(', ')}`);
});

