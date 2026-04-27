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

async function bootstrapComputerScreen(page, baseUrl) {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    await page.waitForFunction(
        () => typeof navigateTo === 'function' &&
            typeof initMode === 'function' &&
            typeof loadProgress === 'function' &&
            typeof goToNextLevel === 'function' &&
            typeof resetToLevel1 === 'function',
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

    await page.evaluate(async () => {
        await navigateTo('computer');
        await initMode('computer');
        if (typeof updateLevelIndicator === 'function') updateLevelIndicator('computer');
    });

    await page.waitForSelector('#computer-screen #computer-level', {
        state: 'visible',
        timeout: 10000
    });
}

async function goToLevel(page, targetLevel) {
    await page.evaluate(async (level) => {
        await resetToLevel1('computer');
        for (let i = 1; i < level; i += 1) {
            await goToNextLevel('computer');
        }
    }, targetLevel);

    await page.waitForFunction((level) => {
        const label = document.getElementById('computer-level');
        return label && label.textContent && label.textContent.trim() === String(level);
    }, targetLevel);

    const currentLevel = (await page.locator('#computer-level').textContent() || '').trim();
    assert.equal(currentLevel, String(targetLevel), `Expected level ${targetLevel}, got ${currentLevel}`);
}

async function testLevel8(page) {
    await goToLevel(page, 8);

    const externalDisplay = await page.locator('#external-zone-panel').evaluate((el) => getComputedStyle(el).display);
    assert.notEqual(externalDisplay, 'none', 'Level 8 must show external zone panel');

    const externalSlots = await page.locator('#external-slots .component-slot').count();
    assert.equal(externalSlots, 2, 'Level 8 should expose 2 external slots (keyboard, mouse)');

    await page.click('#component-palette .component-item[data-component="keyboard"]');
    await page.click('#external-slots .component-slot[data-slot="keyboard"]');

    const afterPlace = ((await page.locator('#computer-progress-chip').textContent()) || '').trim();
    assert.match(afterPlace, /^1\/6/, 'Progress should increase after keyboard is placed');

    await page.click('#external-slots .component-slot[data-slot="keyboard"]');

    const afterRemove = ((await page.locator('#computer-progress-chip').textContent()) || '').trim();
    assert.match(afterRemove, /^0\/6/, 'Progress should decrease after keyboard is removed');
}

async function testLevel9(page) {
    await goToLevel(page, 9);

    const externalDisplay = await page.locator('#external-zone-panel').evaluate((el) => getComputedStyle(el).display);
    assert.notEqual(externalDisplay, 'none', 'Level 9 must show external zone panel');

    const externalSlots = await page.locator('#external-slots .component-slot').count();
    assert.equal(externalSlots, 1, 'Level 9 should expose 1 external slot (monitor)');

    await page.click('#component-palette .component-item[data-component="monitor"]');
    await page.click('#external-slots .component-slot[data-slot="monitor"]');

    const afterPlace = ((await page.locator('#computer-progress-chip').textContent()) || '').trim();
    assert.match(afterPlace, /^1\/6/, 'Progress should increase after monitor is placed');

    await page.click('#external-slots .component-slot[data-slot="monitor"]');

    const afterRemove = ((await page.locator('#computer-progress-chip').textContent()) || '').trim();
    assert.match(afterRemove, /^0\/6/, 'Progress should decrease after monitor is removed');
}

async function autoPlaceAllCurrentComponents(page) {
    await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('#component-palette .component-item[data-component]'));
        for (const item of items) {
            const component = item.dataset.component;
            if (!component) continue;
            const slot = document.querySelector(`.component-slot[data-slot="${component}"]`);
            if (!slot) continue;
            item.click();
            slot.click();
        }
    });
}

async function testLevel15(page) {
    await goToLevel(page, 15);

    const externalDisplay = await page.locator('#external-zone-panel').evaluate((el) => getComputedStyle(el).display);
    assert.notEqual(externalDisplay, 'none', 'Level 15 must show external zone panel');

    const externalSlots = await page.locator('#external-slots .component-slot').count();
    assert.equal(externalSlots, 1, 'Level 15 should expose 1 external slot (OS installer)');

    await autoPlaceAllCurrentComponents(page);

    const readyProgress = ((await page.locator('#computer-progress-chip').textContent()) || '').trim();
    assert.match(readyProgress, /^9\/9/, 'Level 15 should be fully assembled before power on');

    await page.click('#btn-power-computer');

    await page.waitForFunction(() => {
        const status = document.getElementById('case-status');
        return !!status && /Power On - Berhasil!/i.test(status.textContent || '');
    }, { timeout: 12000 });

    const feedbackHtml = await page.locator('#computer-feedback').innerHTML();
    assert.match(feedbackHtml, /Materi yang dipelajari:/i, 'Success feedback should include learning summary section');
    assert.match(feedbackHtml, /Refleksi kompetensi SMA:/i, 'Success feedback should include SMA reflection section');
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
        await bootstrapComputerScreen(page, baseUrl);
        await testLevel8(page);
        await testLevel9(page);
        await testLevel15(page);
        console.log('Computer smoke test passed (levels 8, 9, 15).');
    } finally {
        await context.close();
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
    }
}

run().catch((error) => {
    console.error('Computer smoke test failed.');
    console.error(error);
    process.exitCode = 1;
});
