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

async function bootstrapRobotScreen(page, baseUrl) {
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
        localStorage.removeItem('informatikaLabRobotAnalytics');

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
        await navigateTo('robot');
        await initMode('robot');
        if (typeof updateLevelIndicator === 'function') updateLevelIndicator('robot');

        window.__robotSmokeCompletions = [];
        window.completeLevel = (mode, payload) => {
            window.__robotSmokeCompletions.push({ mode, payload });
        };
    });

    await page.waitForSelector('#robot-screen #robot-level', {
        state: 'visible',
        timeout: 10000
    });
}

async function closeTutorialOverlay(page) {
    await page.evaluate(() => {
        const overlay = document.getElementById('robot-tutorial-overlay');
        if (!overlay) return;
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        overlay.style.opacity = '';
    });
}

async function goToLevel(page, targetLevel) {
    await page.evaluate(async (level) => {
        await resetToLevel1('robot');
        for (let i = 1; i < level; i += 1) {
            await goToNextLevel('robot');
        }
    }, targetLevel);

    await page.waitForFunction((level) => {
        const label = document.getElementById('robot-level');
        return label && label.textContent && label.textContent.trim() === String(level);
    }, targetLevel);

    await page.waitForTimeout(700);
    await closeTutorialOverlay(page);

    const currentLevel = (await page.locator('#robot-level').textContent() || '').trim();
    assert.equal(currentLevel, String(targetLevel), `Expected level ${targetLevel}, got ${currentLevel}`);
}

async function setSequence(page, sequence) {
    await page.click('#btn-clear-robot');

    await page.evaluate((seq) => {
        const blocks = Array.from(document.querySelectorAll('#command-blocks .command-block'));
        const byCommand = new Map(blocks.map((block) => [block.dataset.command, block]));
        seq.forEach((cmd) => {
            const block = byCommand.get(cmd);
            if (block) block.click();
        });
    }, sequence);
}

async function runSequenceAndWait(page) {
    await page.click('#btn-run-robot');

    await page.waitForFunction(() => {
        const status = document.getElementById('robot-run-status');
        return status && /tujuan tercapai|berhenti|belum mencapai|belum sampai|kedua robot/i.test(status.textContent || '');
    }, { timeout: 15000 });
}

async function readMetricNumber(page, selector) {
    const text = ((await page.locator(selector).textContent()) || '').trim();
    const match = text.match(/\d+/);
    return match ? Number(match[0]) : 0;
}

async function testLevel8LoopPreview(page) {
    await goToLevel(page, 8);

    const attemptsBefore = await readMetricNumber(page, '#robot-analytics-attempts');
    assert.equal(attemptsBefore, 0, 'Fresh smoke session should start with zero attempts');

    const gradeFocus = ((await page.locator('#robot-grade-focus').textContent()) || '').trim();
    assert.match(gradeFocus, /Fase E SMA/i, 'Level 8 should show SMA grade-focus chip');

    const objectiveCount = await page.locator('#robot-objectives li').count();
    assert.ok(objectiveCount >= 1, 'Robot objectives list should be visible');

    await setSequence(page, ['loop', 'forward', 'forward']);

    const preview = ((await page.locator('#loop-preview').textContent()) || '').trim();
    assert.match(preview, /4 langkah/i, 'Loop preview should expand to 4 execution steps');

    const progressChip = ((await page.locator('#robot-progress-chip').textContent()) || '').trim();
    assert.match(progressChip, /4 langkah simulasi/i, 'Progress chip should show expanded step count');

    await runSequenceAndWait(page);

    const feedbackText = ((await page.locator('#robot-feedback').textContent()) || '').trim();
    assert.match(feedbackText, /Sukses/i, 'Level 8 run should end with success feedback');

    const attemptsAfter = await readMetricNumber(page, '#robot-analytics-attempts');
    assert.equal(attemptsAfter, 1, 'Successful run should increment attempts counter');

    const efficiency = ((await page.locator('#robot-analytics-efficiency').textContent()) || '').trim();
    assert.match(efficiency, /\d+%/, 'Analytics should show efficiency percentage');
}

async function testLevel16DualSuccess(page) {
    await goToLevel(page, 16);

    const dualBadgeText = ((await page.locator('#robot-dual-badge').textContent()) || '').trim();
    assert.match(dualBadgeText, /DUAL MODE/i, 'Level 16 should show dual mode badge');

    await setSequence(page, ['forward', 'forward', 'forward', 'forward']);
    await runSequenceAndWait(page);

    const statusText = ((await page.locator('#robot-run-status').textContent()) || '').trim();
    assert.match(statusText, /tujuan tercapai/i, 'Dual level should complete successfully');
}

async function testLevel17MirrorFeedback(page) {
    await goToLevel(page, 17);

    const dualBadgeText = ((await page.locator('#robot-dual-badge').textContent()) || '').trim();
    assert.match(dualBadgeText, /MIRROR MODE/i, 'Level 17 should show mirror mode badge');

    await setSequence(page, ['forward', 'forward', 'forward', 'forward', 'forward']);
    await runSequenceAndWait(page);

    const statusText = ((await page.locator('#robot-run-status').textContent()) || '').trim();
    assert.match(statusText, /berhenti/i, 'Mirror failure should update run status');

    const feedbackText = ((await page.locator('#robot-feedback').textContent()) || '').trim();
    assert.match(feedbackText, /Coaching/i, 'Mirror failure should include coaching section');
    assert.match(feedbackText, /mirror|KIRI|KANAN/i, 'Mirror coaching should mention mirrored turns');

    const outCount = await readMetricNumber(page, '#robot-analytics-out');
    assert.ok(outCount >= 1, 'Mirror crash should increase out-of-grid metric');

    await setSequence(page, ['forward', 'right', 'forward', 'forward', 'left', 'forward', 'right', 'forward']);
    await runSequenceAndWait(page);

    const successStatus = ((await page.locator('#robot-run-status').textContent()) || '').trim();
    assert.match(successStatus, /tujuan tercapai/i, 'Rebalanced mirror level should be solvable');
}

async function testLevel20ObjectivePanel(page) {
    await goToLevel(page, 20);

    const gradeFocus = ((await page.locator('#robot-grade-focus').textContent()) || '').trim();
    assert.match(gradeFocus, /Fase F SMA/i, 'Level 20 should show advanced SMA focus');

    const objectiveCount = await page.locator('#robot-objectives li').count();
    assert.ok(objectiveCount >= 1, 'Level 20 should render objective list');

    await setSequence(page, ['forward', 'forward']);
    await runSequenceAndWait(page);

    const wallCount = await readMetricNumber(page, '#robot-analytics-wall');
    assert.ok(wallCount >= 1, 'Wall collision should increase wall metric');
}

async function assertCompletionLog(page) {
    const completedRuns = await page.evaluate(() =>
        Array.isArray(window.__robotSmokeCompletions) ? window.__robotSmokeCompletions : []
    );

    assert.ok(completedRuns.length >= 3, 'Robot smoke should trigger at least three completion events');
    assert.ok(completedRuns.every((entry) => entry.mode === 'robot'), 'Completion events should come from robot mode');
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
        await bootstrapRobotScreen(page, baseUrl);
        await testLevel8LoopPreview(page);
        await testLevel16DualSuccess(page);
        await testLevel17MirrorFeedback(page);
        await testLevel20ObjectivePanel(page);
        await assertCompletionLog(page);
        console.log('Robot smoke test passed (levels 8, 16, 17, 20 + analytics).');
    } finally {
        await context.close();
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
    }
}

run().catch((error) => {
    console.error('Robot smoke test failed.');
    console.error(error);
    process.exitCode = 1;
});
