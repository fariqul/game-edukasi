const test = require('node:test');
const assert = require('node:assert/strict');

const {
    createRobotAnalyticsState,
    computeEfficiency,
    recordRobotAttempt,
    recordRobotFailure,
    recordRobotSuccess,
    summarizeRobotAnalytics
} = require('../js/robotAnalyticsRules.js');

test('computeEfficiency menghitung rasio minCommands terhadap command aktual', () => {
    assert.equal(computeEfficiency(8, 8), 100);
    assert.equal(computeEfficiency(10, 8), 80);
    assert.equal(computeEfficiency(0, 8), 0);
});

test('recordRobotAttempt menambah total dan attempt level', () => {
    const start = createRobotAnalyticsState();
    const next = recordRobotAttempt(start, 17, 8);

    assert.equal(next.totalAttempts, 1);
    assert.equal(next.levels['17'].attempts, 1);
    assert.equal(next.levels['17'].minCommands, 8);
});

test('recordRobotFailure mengelompokkan reason out/wall/other', () => {
    let state = createRobotAnalyticsState();
    state = recordRobotFailure(state, 17, 'out');
    state = recordRobotFailure(state, 17, 'wall');
    state = recordRobotFailure(state, 17, 'unknown');

    assert.equal(state.totalFailures, 3);
    assert.equal(state.failureByReason.out, 1);
    assert.equal(state.failureByReason.wall, 1);
    assert.equal(state.failureByReason.other, 1);
});

test('recordRobotSuccess menyimpan best efficiency per level', () => {
    let state = createRobotAnalyticsState();
    state = recordRobotAttempt(state, 17, 8);
    state = recordRobotSuccess(state, 17, 10, 8);
    state = recordRobotSuccess(state, 17, 8, 8);

    assert.equal(state.totalSuccesses, 2);
    assert.equal(state.levels['17'].bestEfficiency, 100);
    assert.equal(state.levels['17'].bestCommands, 8);
});

test('summarizeRobotAnalytics menyiapkan ringkasan dashboard', () => {
    let state = createRobotAnalyticsState();
    state = recordRobotAttempt(state, 8, 3);
    state = recordRobotSuccess(state, 8, 3, 3);
    state = recordRobotAttempt(state, 20, 12);
    state = recordRobotFailure(state, 20, 'wall');

    const summary = summarizeRobotAnalytics(state, 3);

    assert.equal(summary.totalAttempts, 2);
    assert.equal(summary.failuresWall, 1);
    assert.equal(summary.overallEfficiency, 100);
    assert.equal(summary.levelSummaries.length, 2);
});
