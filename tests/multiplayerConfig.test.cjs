const test = require('node:test');
const assert = require('node:assert/strict');
const { getConfig } = require('../js/multiplayerConfig.js');

test('getConfig: default tetap aman tanpa server custom', () => {
    const cfg = getConfig({});
    assert.equal(cfg.prefix, 'infolab_');
    assert.equal(cfg.peerOptions.debug, 0);
    assert.equal('host' in cfg.peerOptions, false);
    assert.equal('path' in cfg.peerOptions, false);
});

test('getConfig: dukung signaling render + TURN credentials', () => {
    const cfg = getConfig({
        prefix: 'kelas_',
        signaling: {
            host: 'game-peer.onrender.com',
            path: 'peerjs',
            secure: true,
            port: 443
        },
        rtc: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                {
                    urls: ['turn:global.relay.metered.ca:80?transport=tcp'],
                    username: 'user',
                    credential: 'pass'
                }
            ]
        }
    });

    assert.equal(cfg.prefix, 'kelas_');
    assert.equal(cfg.peerOptions.host, 'game-peer.onrender.com');
    assert.equal(cfg.peerOptions.path, '/peerjs');
    assert.equal(cfg.peerOptions.secure, true);
    assert.equal(cfg.peerOptions.port, 443);
    assert.deepEqual(cfg.peerOptions.config.iceServers[0], { urls: ['stun:stun.l.google.com:19302'] });
    assert.equal(cfg.peerOptions.config.iceServers[1].username, 'user');
});

test('getConfig: abaikan entri ice server invalid', () => {
    const cfg = getConfig({
        rtc: {
            iceServers: [
                {},
                { urls: '' },
                { urls: 'turn:relay.example.com:80?transport=tcp' }
            ]
        }
    });

    assert.equal(cfg.peerOptions.config.iceServers.length, 0);
});
