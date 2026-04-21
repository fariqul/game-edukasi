const test = require('node:test');
const assert = require('node:assert/strict');
const {
    shouldShowGuestWaitingOverlay
} = require('../js/multiplayerUiRules.js');

test('shouldShowGuestWaitingOverlay: hanya tampil saat guest aktif di dashboard', () => {
    assert.equal(
        shouldShowGuestWaitingOverlay({ active: true, isHost: false, currentScreen: 'dashboard' }),
        true
    );
    assert.equal(
        shouldShowGuestWaitingOverlay({ active: true, isHost: false, currentScreen: 'coding' }),
        false
    );
    assert.equal(
        shouldShowGuestWaitingOverlay({ active: true, isHost: true, currentScreen: 'dashboard' }),
        false
    );
    assert.equal(
        shouldShowGuestWaitingOverlay({ active: false, isHost: false, currentScreen: 'dashboard' }),
        false
    );
});
