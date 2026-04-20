const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const TARGETS = [
    path.join(ROOT, 'index.html'),
    path.join(ROOT, 'js')
];

const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

function collectFiles(inputPath) {
    const stats = fs.statSync(inputPath);
    if (stats.isFile()) return [inputPath];
    return fs.readdirSync(inputPath)
        .filter(name => name.endsWith('.js'))
        .map(name => path.join(inputPath, name));
}

test('UI text source does not contain emoji-like symbols', () => {
    const files = TARGETS.flatMap(collectFiles);
    const offenders = [];

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        if (EMOJI_REGEX.test(content)) offenders.push(path.relative(ROOT, file));
    }

    assert.deepEqual(
        offenders,
        [],
        `Found emoji-like symbols in: ${offenders.join(', ')}`
    );
});

