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

async function bootstrap(page, baseUrl) {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    await page.waitForFunction(
        () => typeof navigateTo === 'function'
            && typeof initMode === 'function'
            && typeof loadProgress === 'function'
            && typeof syncMultiplayerFocusUi === 'function'
            && typeof toggleHintPanel === 'function',
        { timeout: 20000 }
    );

    await page.evaluate(() => {
        localStorage.setItem('selectedCharacter', 'alex');
        localStorage.setItem('playerName', 'Smoke Tester');

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

        loadProgress();
    });
}

async function assertCompetitiveCopy(page) {
    const multiplayerDesc = ((await page.locator('#play-mode-screen .pm-card').nth(1).locator('p').textContent()) || '').trim();
    assert.match(multiplayerDesc, /balapan skor dan waktu/i, 'Multiplayer card copy should emphasize competitive play');

    await page.evaluate(() => {
        Multiplayer.goMultiplayer();
    });

    await page.waitForFunction(() => document.getElementById('lobby-screen')?.classList.contains('active'));

    const lobbyTagline = ((await page.locator('#lobby-screen .text-center p').first().textContent()) || '').trim();
    assert.match(lobbyTagline, /kompetitif hingga 30 pemain/i, 'Lobby tagline should be concise and competitive');

    const cardTitles = await page.evaluate(() =>
        Array.from(document.querySelectorAll('#lobby-screen .group.lobby-panel h3')).map((el) => el.textContent.trim())
    );
    assert.deepEqual(cardTitles, ['Jadi Host', 'Masuk Room']);

    const hasBackButtonId = await page.evaluate(() => {
        const el = document.getElementById('lobby-back-btn');
        return Boolean(el && el.textContent.includes('Kembali'));
    });
    assert.equal(hasBackButtonId, true, 'Lobby back button should expose id for lock-state handling');

    await page.evaluate(() => {
        Multiplayer.showClassBattleHostForm();
    });

    const hostPanelVisible = await page.evaluate(() => {
        const panel = document.getElementById('class-host-panel');
        return Boolean(panel && !panel.classList.contains('hidden'));
    });
    assert.equal(hostPanelVisible, true, 'Host form should open from lobby card');

    const hostTitle = ((await page.locator('#class-host-panel h3').textContent()) || '').trim();
    assert.equal(hostTitle, 'Buat Match Class Battle');

    const startButtonText = ((await page.locator('#class-start-btn').textContent()) || '').trim();
    assert.equal(startButtonText, 'Mulai Match');

    await page.evaluate(() => {
        Multiplayer.showClassBattleJoinForm();
    });

    const joinPanelVisible = await page.evaluate(() => {
        const panel = document.getElementById('class-join-panel');
        return Boolean(panel && !panel.classList.contains('hidden'));
    });
    assert.equal(joinPanelVisible, true, 'Join form should open from lobby card');

    const joinCodeLabel = ((await page.locator('#class-join-panel label').nth(1).textContent()) || '').trim();
    assert.equal(joinCodeLabel, 'Kode Match (6 digit):');

    const vsTitle = ((await page.locator('#vs-vs-title h2').textContent()) || '').trim();
    assert.equal(vsTitle, 'Ruang Siap');

    const vsWait = ((await page.locator('#vs-wait-msg').textContent()) || '').trim();
    assert.match(vsWait, /menunggu host memulai match/i);
}

async function enableSyntheticMultiplayer(page) {
    await page.evaluate(() => {
        window.__multiplayerSmokeOriginal = {
            isActive: Multiplayer.isActive,
            isHostPlayer: Multiplayer.isHostPlayer
        };

        Multiplayer.isActive = () => true;
        Multiplayer.isHostPlayer = () => true;
    });
}

async function disableSyntheticMultiplayer(page) {
    await page.evaluate(() => {
        const original = window.__multiplayerSmokeOriginal;
        if (original && typeof original.isActive === 'function') {
            Multiplayer.isActive = original.isActive;
        }
        if (original && typeof original.isHostPlayer === 'function') {
            Multiplayer.isHostPlayer = original.isHostPlayer;
        }
        delete window.__multiplayerSmokeOriginal;
    });
}

async function assertMultiplayerFocusUi(page) {
    await enableSyntheticMultiplayer(page);

    await page.evaluate(async () => {
        await navigateTo('robot');
        await initMode('robot');
        if (typeof updateLevelIndicator === 'function') updateLevelIndicator('robot');
    });

    await page.waitForSelector('#robot-screen.active', { timeout: 10000 });
    await page.waitForFunction(() => document.body.classList.contains('multiplayer-focus-ui'));

    const hiddenInFocus = await page.evaluate(() => {
        const selectors = [
            '#robot-screen .hint-panel',
            '#robot-screen .robot-learning-panel',
            '#robot-analytics-panel'
        ];

        return selectors.every((selector) => {
            const el = document.querySelector(selector);
            return Boolean(el) && getComputedStyle(el).display === 'none';
        });
    });
    assert.equal(hiddenInFocus, true, 'Hint and learning surfaces should be hidden during multiplayer gameplay focus');

    const hintToggleBlocked = await page.evaluate(() => {
        const panel = document.querySelector('#robot-screen .hint-panel');
        if (!panel) return false;

        panel.classList.remove('open');
        const content = panel.querySelector('.hint-content');
        if (content) content.style.display = 'none';

        const btn = panel.querySelector('.hint-toggle-btn');
        if (!btn || typeof toggleHintPanel !== 'function') return false;

        toggleHintPanel(btn);
        return panel.classList.contains('open') === false;
    });
    assert.equal(hintToggleBlocked, true, 'Hint toggle should be blocked while multiplayer focus mode is active');

    await page.waitForTimeout(900);
    const tutorialHidden = await page.evaluate(() => {
        const overlay = document.getElementById('robot-tutorial-overlay');
        return Boolean(overlay)
            && overlay.classList.contains('hidden')
            && !overlay.classList.contains('flex');
    });
    assert.equal(tutorialHidden, true, 'Robot tutorial overlay should not appear during multiplayer gameplay');

    await page.evaluate(() => {
        const overlay = document.getElementById('concept-summary-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
        }

        if (typeof AdaptiveHints !== 'undefined' && typeof AdaptiveHints.showConceptSummary === 'function') {
            AdaptiveHints.showConceptSummary('robot', 1);
        }
    });

    await page.waitForTimeout(3700);
    const conceptStillHidden = await page.evaluate(() => {
        const overlay = document.getElementById('concept-summary-overlay');
        return Boolean(overlay)
            && overlay.classList.contains('hidden')
            && !overlay.classList.contains('flex');
    });
    assert.equal(conceptStillHidden, true, 'Concept summary overlay should remain suppressed in multiplayer focus mode');

    await disableSyntheticMultiplayer(page);

    await page.evaluate(async () => {
        await navigateTo('dashboard');
        syncMultiplayerFocusUi('dashboard');
    });

    await page.waitForFunction(() => !document.body.classList.contains('multiplayer-focus-ui'));

    const hintToggleWorksAgain = await page.evaluate(() => {
        const panel = document.querySelector('#robot-screen .hint-panel');
        if (!panel) return false;

        panel.classList.remove('open');
        const content = panel.querySelector('.hint-content');
        if (content) content.style.display = 'none';

        const btn = panel.querySelector('.hint-toggle-btn');
        if (!btn || typeof toggleHintPanel !== 'function') return false;

        toggleHintPanel(btn);
        return panel.classList.contains('open');
    });
    assert.equal(hintToggleWorksAgain, true, 'Hint toggle should work again outside multiplayer focus mode');
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
    const page = await context.newPage();

    try {
        await bootstrap(page, baseUrl);
        await assertCompetitiveCopy(page);
        await assertMultiplayerFocusUi(page);
        console.log('Multiplayer focus smoke test passed (copy + focus gameplay UI).');
    } finally {
        await context.close();
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
    }
}

run().catch((error) => {
    console.error('Multiplayer focus smoke test failed.');
    console.error(error);
    process.exitCode = 1;
});
