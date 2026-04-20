const test = require('node:test');
const assert = require('node:assert/strict');
const {
    mapPeerErrorMessage,
    shouldAttemptReconnect
} = require('../js/multiplayerRules.js');

test('mapPeerErrorMessage: peer-unavailable punya pesan jelas', () => {
    const msg = mapPeerErrorMessage('peer-unavailable', false);
    assert.match(msg, /Room tidak ditemukan|lawan offline/);
});

test('shouldAttemptReconnect: hanya untuk disconnected yang belum destroyed', () => {
    assert.equal(shouldAttemptReconnect({ disconnected: true, destroyed: false }), true);
    assert.equal(shouldAttemptReconnect({ disconnected: false, destroyed: false }), false);
    assert.equal(shouldAttemptReconnect({ disconnected: true, destroyed: true }), false);
});
