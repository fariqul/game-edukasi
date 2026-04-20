const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeGameState } = require('../js/stateGuards.js');

test('normalizeGameState mengisi mode yang hilang dan clamp nilai', () => {
    const defaults = {
        progress: {
            robot: { completed: 0, total: 20 },
            network: { completed: 0, total: 17 },
            computer: { completed: 0, total: 15 },
            coding: { completed: 0, total: 15 },
            circuit: { completed: 0, total: 3 }
        },
        currentLevel: {
            robot: 1,
            network: 1,
            computer: 1,
            coding: 1,
            circuit: 1
        }
    };

    const saved = {
        progress: {
            robot: { completed: 999 },
            coding: { completed: -2 }
        },
        currentLevel: {
            robot: 0,
            circuit: 100
        }
    };

    const result = normalizeGameState(saved, defaults);
    assert.equal(result.progress.robot.completed, 20);
    assert.equal(result.progress.coding.completed, 0);
    assert.equal(result.progress.network.completed, 0);
    assert.equal(result.currentLevel.robot, 1);
    assert.equal(result.currentLevel.circuit, 3);
    assert.equal(result.currentLevel.network, 1);
});

test('normalizeGameState mengabaikan payload invalid', () => {
    const defaults = {
        progress: {
            robot: { completed: 0, total: 20 },
            network: { completed: 0, total: 17 },
            computer: { completed: 0, total: 15 },
            coding: { completed: 0, total: 15 },
            circuit: { completed: 0, total: 3 }
        },
        currentLevel: {
            robot: 1,
            network: 1,
            computer: 1,
            coding: 1,
            circuit: 1
        }
    };

    const result = normalizeGameState({ progress: 'bad', currentLevel: null }, defaults);
    assert.deepEqual(result, defaults);
});
