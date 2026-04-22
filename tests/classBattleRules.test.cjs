const test = require('node:test');
const assert = require('node:assert/strict');
const {
    computeClassBattleScore,
    rankSubmissions,
    resolveDuplicateDisplayName,
    shouldLockSubmission
} = require('../js/classBattleRules.js');

test('rankSubmissions: urut score desc lalu time asc lalu submitted_at', () => {
    const ranked = rankSubmissions([
        { name: 'A', score: 80, timeMs: 30000, submittedAt: '2026-04-21T01:00:00Z' },
        { name: 'B', score: 80, timeMs: 28000, submittedAt: '2026-04-21T01:00:05Z' },
        { name: 'C', score: 70, timeMs: 15000, submittedAt: '2026-04-21T01:00:03Z' }
    ]);

    assert.deepEqual(ranked.map((row) => row.name), ['B', 'A', 'C']);
});

test('resolveDuplicateDisplayName: memberi suffix jika nama sudah ada', () => {
    const existingNames = new Set(['andi#1', 'andi#2']);
    const resolved = resolveDuplicateDisplayName(existingNames, 'Andi');

    assert.equal(resolved.displayName, 'Andi #3');
    assert.equal(resolved.normalized, 'andi');
    assert.equal(resolved.suffix, 3);
});

test('computeClassBattleScore: skor level dan bonus waktu valid', () => {
    const score = computeClassBattleScore({ reachedLevel: 5, targetLevel: 5, elapsedMs: 19000 });
    assert.equal(score, 1481);
});

test('shouldLockSubmission: lock setelah countdown habis', () => {
    const shouldLock = shouldLockSubmission({
        status: 'in_progress',
        firstFinishStartedAt: '2026-04-21T10:00:00.000Z',
        countdownSeconds: 10,
        nowMs: new Date('2026-04-21T10:00:10.000Z').getTime()
    });

    assert.equal(shouldLock, true);
});
