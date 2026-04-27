const test = require('node:test');
const assert = require('node:assert/strict');

const {
    getRobotGradeFocus,
    buildRobotObjectives,
    buildRobotCoachingHints
} = require('../js/robotLearningRules.js');

test('getRobotGradeFocus memetakan level ke fase SMA', () => {
    assert.equal(getRobotGradeFocus(4), 'Fase E SMA - Dasar algoritma');
    assert.equal(getRobotGradeFocus(12), 'Fase F SMA - Optimasi algoritma');
    assert.equal(getRobotGradeFocus(18), 'Fase F SMA - Berpikir komputasional paralel');
});

test('buildRobotObjectives menyertakan tujuan loop dan obstacle', () => {
    const objectives = buildRobotObjectives({
        id: 8,
        solution: ['loop', 'forward', 'right'],
        grid: [
            ['S', 'X', 'G'],
            ['.', '.', '.'],
            ['.', '.', '.']
        ]
    });

    assert.equal(objectives.length, 3);
    assert.match(objectives.join(' '), /loop/i);
    assert.match(objectives.join(' '), /rintangan/i);
});

test('buildRobotCoachingHints menyesuaikan reason crash mirror', () => {
    const hints = buildRobotCoachingHints({ reason: 'out', dualMode: 'mirror' });
    const merged = hints.join(' ');
    assert.match(merged, /keluar grid|tepi peta/i);
    assert.match(merged, /mirror|KIRI|KANAN/i);
});
