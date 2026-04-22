const test = require('node:test');
const assert = require('node:assert/strict');
const { createClassBattleService } = require('../js/classBattleService.js');

test('createSession: menyimpan mode + target level + kapasitas', async () => {
    const calls = [];
    const fake = {
        from(table) {
            return {
                insert(rows) {
                    calls.push({ table, rows });
                    const chain = {
                        select() { return chain; },
                        async single() { return { data: rows[0], error: null }; }
                    };
                    return chain;
                }
            };
        }
    };

    const svc = createClassBattleService(fake);
    const row = await svc.createSession({
        hostName: 'Guru',
        mode: 'coding',
        targetLevel: 5,
        perLevelSeconds: 25,
        maxParticipants: 30
    });

    assert.equal(calls[0].table, 'guest_sessions');
    assert.equal(calls[0].rows[0].target_level, 5);
    assert.equal(calls[0].rows[0].finish_countdown_seconds, 25);
    assert.equal(row.mode, 'coding');
});

test('submitResultWithRetry: retry 1x saat attempt pertama gagal', async () => {
    let attempts = 0;
    const fake = {
        from() {
            return {
                upsert(payload) {
                    const chain = {
                        select() { return chain; },
                        async single() {
                            attempts += 1;
                            if (attempts === 1) {
                                return { data: null, error: new Error('temporary') };
                            }
                            return { data: { ...payload, ok: true }, error: null };
                        }
                    };
                    return chain;
                }
            };
        }
    };

    const svc = createClassBattleService(fake);
    const row = await svc.submitResultWithRetry({
        sessionId: 's1',
        participantId: 'p1',
        reachedLevel: 5,
        score: 500,
        timeMs: 15000
    });

    assert.equal(attempts, 2);
    assert.equal(row.ok, true);
});

test('assertSessionOpen: throw jika status finished', () => {
    const svc = createClassBattleService({ from: () => ({}) });

    assert.throws(
        () => svc.assertSessionOpen({ status: 'finished' }),
        /Sesi sudah ditutup/
    );
});
