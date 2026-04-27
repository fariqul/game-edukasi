const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { once } = require('node:events');
const http = require('node:http');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');

const MIME_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const MOCK_PEER_INIT_SCRIPT = String.raw`
(() => {
    if (window.__INFOLAB_MOCK_PEER_INSTALLED__) return;
    window.__INFOLAB_MOCK_PEER_INSTALLED__ = true;

    const BUS_NAME = '__infolab_mock_peer_bus_v1__';
    const bus = new BroadcastChannel(BUS_NAME);

    class Emitter {
        constructor() {
            this._listeners = new Map();
        }

        on(event, handler) {
            if (!this._listeners.has(event)) {
                this._listeners.set(event, new Set());
            }
            this._listeners.get(event).add(handler);
            return this;
        }

        off(event, handler) {
            const set = this._listeners.get(event);
            if (set) set.delete(handler);
            return this;
        }

        emit(event, ...args) {
            const set = this._listeners.get(event);
            if (!set) return;
            for (const handler of set) {
                try {
                    handler(...args);
                } catch (_error) {
                    // Ignore listener errors in mock bus.
                }
            }
        }
    }

    function makeId(prefix) {
        return prefix + Math.random().toString(36).slice(2, 10);
    }

    class MockConnection extends Emitter {
        constructor(peer, remotePeerId, connId) {
            super();
            this.peer = peer.id;
            this.remotePeerId = remotePeerId;
            this._connId = connId;
            this.open = false;
            this._closed = false;
        }

        send(payload) {
            if (!this.open || this._closed) return;
            bus.postMessage({
                scope: BUS_NAME,
                type: 'data',
                connId: this._connId,
                from: this.peer,
                to: this.remotePeerId,
                payload
            });
        }

        close() {
            if (this._closed) return;
            this._closed = true;
            const wasOpen = this.open;
            this.open = false;
            if (wasOpen) this.emit('close');

            bus.postMessage({
                scope: BUS_NAME,
                type: 'close',
                connId: this._connId,
                from: this.peer,
                to: this.remotePeerId
            });
        }

        _markOpen() {
            if (this._closed || this.open) return;
            this.open = true;
            this.emit('open');
        }

        _receiveData(payload) {
            if (this._closed) return;
            this.emit('data', payload);
        }

        _remoteClose() {
            if (this._closed) return;
            this._closed = true;
            const wasOpen = this.open;
            this.open = false;
            if (wasOpen) this.emit('close');
        }
    }

    class MockPeer extends Emitter {
        constructor(peerId) {
            super();
            this.id = typeof peerId === 'string' && peerId.trim() ? peerId.trim() : makeId('mock_');
            this.destroyed = false;
            this.disconnected = false;
            this._connections = new Map();
            this._onBusMessage = (event) => this._handleBusMessage(event && event.data);

            bus.addEventListener('message', this._onBusMessage);

            setTimeout(() => {
                if (this.destroyed) return;
                this.emit('open', this.id);
            }, 0);
        }

        connect(targetPeerId) {
            if (this.destroyed) {
                const dead = new MockConnection(this, String(targetPeerId || ''), makeId('dead_'));
                setTimeout(() => dead.emit('error', new Error('Peer destroyed')), 0);
                return dead;
            }

            const remoteId = String(targetPeerId || '').trim();
            const connId = makeId('conn_');
            const conn = new MockConnection(this, remoteId, connId);
            this._connections.set(connId, conn);

            bus.postMessage({
                scope: BUS_NAME,
                type: 'connect-request',
                connId,
                from: this.id,
                to: remoteId
            });

            return conn;
        }

        reconnect() {
            this.disconnected = false;
        }

        destroy() {
            if (this.destroyed) return;
            this.destroyed = true;
            this.disconnected = true;

            for (const conn of this._connections.values()) {
                conn._remoteClose();
            }
            this._connections.clear();

            bus.postMessage({
                scope: BUS_NAME,
                type: 'peer-destroy',
                peerId: this.id
            });

            bus.removeEventListener('message', this._onBusMessage);
            this.emit('close');
        }

        _handleBusMessage(message) {
            if (!message || message.scope !== BUS_NAME || this.destroyed) return;

            if (message.type === 'connect-request' && message.to === this.id) {
                const incoming = new MockConnection(this, message.from, message.connId);
                this._connections.set(message.connId, incoming);
                this.emit('connection', incoming);

                bus.postMessage({
                    scope: BUS_NAME,
                    type: 'connect-accept',
                    connId: message.connId,
                    from: this.id,
                    to: message.from
                });

                setTimeout(() => incoming._markOpen(), 0);
                return;
            }

            if (message.type === 'connect-accept' && message.to === this.id) {
                const conn = this._connections.get(message.connId);
                if (conn) {
                    setTimeout(() => conn._markOpen(), 0);
                }
                return;
            }

            if (message.type === 'data' && message.to === this.id) {
                const conn = this._connections.get(message.connId);
                if (conn) conn._receiveData(message.payload);
                return;
            }

            if (message.type === 'close' && message.to === this.id) {
                const conn = this._connections.get(message.connId);
                if (conn) {
                    conn._remoteClose();
                    this._connections.delete(message.connId);
                }
                return;
            }

            if (message.type === 'peer-destroy' && message.peerId !== this.id) {
                for (const [connId, conn] of this._connections.entries()) {
                    if (conn.remotePeerId === message.peerId) {
                        conn._remoteClose();
                        this._connections.delete(connId);
                    }
                }
                this.disconnected = true;
                this.emit('disconnected');
            }
        }
    }

    window.Peer = MockPeer;
})();
`;

function sendNotFound(res) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
}

function startStaticServer(rootDir) {
    const server = http.createServer((req, res) => {
        try {
            const requestUrl = new URL(req.url || '/', 'http://127.0.0.1');
            let pathname = decodeURIComponent(requestUrl.pathname);
            if (pathname === '/') pathname = '/index.html';

            const candidatePath = path.normalize(path.join(rootDir, pathname));
            if (!candidatePath.startsWith(rootDir)) {
                res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Forbidden');
                return;
            }

            let filePath = candidatePath;
            if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            }

            if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
                sendNotFound(res);
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, {
                'Cache-Control': 'no-store',
                'Content-Type': contentType
            });

            fs.createReadStream(filePath).pipe(res);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`Server error: ${error.message}`);
        }
    });

    server.listen(0, '127.0.0.1');
    return server;
}

async function ensureLegacyRoomDom(page) {
    await page.evaluate(() => {
        function ensure(tag, id) {
            let el = document.getElementById(id);
            if (!el) {
                el = document.createElement(tag);
                el.id = id;
                document.body.appendChild(el);
            }
            return el;
        }

        ensure('input', 'input-room-pin');
        ensure('div', 'lobby-join-status');
        ensure('div', 'lobby-create-status');
        const pinArea = ensure('div', 'lobby-pin-area');
        pinArea.classList.add('hidden');
        ensure('div', 'lobby-pin-digits');
    });
}

async function bootstrapPage(page, baseUrl, playerName, charId) {
    await page.addInitScript({ content: MOCK_PEER_INIT_SCRIPT });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    await page.waitForFunction(
        () => typeof Multiplayer !== 'undefined'
            && typeof navigateTo === 'function'
            && typeof loadProgress === 'function'
            && typeof CharacterSystem !== 'undefined',
        { timeout: 20000 }
    );

    await page.evaluate(({ name, selectedChar }) => {
        localStorage.setItem('selectedCharacter', selectedChar);
        localStorage.setItem('playerName', name);

        localStorage.setItem('informatikaLabProgress', JSON.stringify({
            progress: {
                robot: { completed: 20, total: 20 },
                network: { completed: 17, total: 17 },
                computer: { completed: 15, total: 15 },
                coding: { completed: 15, total: 15 },
                circuit: { completed: 3, total: 3 }
            },
            currentLevel: {
                robot: 1,
                network: 1,
                computer: 1,
                coding: 1,
                circuit: 1
            }
        }));

        if (typeof loadProgress === 'function') {
            loadProgress();
        }

        CharacterSystem.getPlayerName = () => name;
        CharacterSystem.getSelected = () => ({ id: selectedChar });
    }, { name: playerName, selectedChar: charId });

    await ensureLegacyRoomDom(page);
}

async function runRoomFlow(hostPage, guestPage) {
    await hostPage.evaluate(() => {
        Multiplayer.createRoom();
    });

    const roomCode = await hostPage.waitForFunction(() => {
        const pinEl = document.getElementById('lobby-pin-digits');
        if (!pinEl) return null;
        const code = (pinEl.textContent || '').replace(/\D/g, '');
        return code.length === 6 ? code : null;
    }, { timeout: 15000 });

    const roomPin = await roomCode.jsonValue();
    assert.match(roomPin, /^\d{6}$/, 'Host should create a 6-digit room code');

    await guestPage.evaluate((pin) => {
        const input = document.getElementById('input-room-pin');
        if (input) input.value = pin;
        Multiplayer.joinRoom();
    }, roomPin);

    await hostPage.waitForFunction(() => Multiplayer.isActive(), { timeout: 15000 });
    await guestPage.waitForFunction(() => Multiplayer.isActive(), { timeout: 15000 });

    const joinStatus = await guestPage.evaluate(() => {
        const el = document.getElementById('lobby-join-status');
        return el ? (el.textContent || '').trim() : '';
    });
    assert.ok(joinStatus.length > 0, 'Guest should receive connection feedback while joining');
}

async function runMatchFlow(hostPage, guestPage) {
    await hostPage.evaluate(() => {
        Multiplayer.startMultiplayerMode('robot');
    });

    await hostPage.waitForFunction(
        () => typeof GameState !== 'undefined'
            && GameState.currentScreen === 'robot'
            && document.body.classList.contains('multiplayer-focus-ui'),
        { timeout: 20000 }
    );

    await guestPage.waitForFunction(
        () => typeof GameState !== 'undefined'
            && GameState.currentScreen === 'robot'
            && document.body.classList.contains('multiplayer-focus-ui'),
        { timeout: 20000 }
    );

    await hostPage.evaluate(() => Multiplayer.onMyComplete());
    await guestPage.evaluate(() => Multiplayer.onMyComplete());

    await hostPage.waitForFunction(() => {
        const modal = document.getElementById('mp-result-modal');
        return Boolean(modal)
            && modal.classList.contains('flex')
            && !modal.classList.contains('hidden');
    }, { timeout: 15000 });

    await guestPage.waitForFunction(() => {
        const modal = document.getElementById('mp-result-modal');
        return Boolean(modal)
            && modal.classList.contains('flex')
            && !modal.classList.contains('hidden');
    }, { timeout: 15000 });

    const hostTitle = ((await hostPage.locator('#mp-result-title').textContent()) || '').trim();
    const guestTitle = ((await guestPage.locator('#mp-result-title').textContent()) || '').trim();

    assert.match(hostTitle, /Menang|Peringkat|Hasil Match/i, 'Host result title should use competitive microcopy');
    assert.match(guestTitle, /Menang|Peringkat|Hasil Match/i, 'Guest result title should use competitive microcopy');

    const hostRows = await hostPage.locator('#result-player-list .flex').count();
    const guestRows = await guestPage.locator('#result-player-list .flex').count();
    assert.ok(hostRows >= 2, 'Host should see at least 2 players in result ranking');
    assert.ok(guestRows >= 2, 'Guest should see at least 2 players in result ranking');
}

async function run() {
    const server = startStaticServer(ROOT);
    await once(server, 'listening');
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}/index.html`;

    let browser;
    try {
        browser = await chromium.launch({ headless: true });
    } catch (error) {
        const message = String(error && error.message ? error.message : error);
        if (!/Executable doesn't exist/i.test(message)) {
            throw error;
        }
        browser = await chromium.launch({ channel: 'chrome', headless: true });
    }

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const hostPage = await context.newPage();
    const guestPage = await context.newPage();

    try {
        await bootstrapPage(hostPage, baseUrl, 'Host QA', 'maleAdventurer');
        await bootstrapPage(guestPage, baseUrl, 'Guest QA', 'femaleAdventurer');

        await runRoomFlow(hostPage, guestPage);
        await runMatchFlow(hostPage, guestPage);

        console.log('Multiplayer room smoke test passed (2-client room + match flow with local signaling mock).');
    } finally {
        await context.close();
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
    }
}

run().catch((error) => {
    console.error('Multiplayer room smoke test failed.');
    console.error(error);
    process.exitCode = 1;
});
