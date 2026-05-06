/**
 * scoreApi.js
 * Client-side helper for saving and reading student scores via the
 * Netlify Function at /api/scores (backed by Netlify Database / Postgres).
 *
 * Usage:
 *   ScoreApi.saveScore({
 *     studentName: 'Budi',
 *     mode: 'robot',
 *     level: 3,
 *     score: 1200,
 *     stars: 3,
 *     xpTotal: 540,
 *     timeTaken: 84,
 *     hintsUsed: 0,
 *     metadata: { perfect: true }
 *   });
 *
 *   const list = await ScoreApi.getScores({ studentName: 'Budi' });
 *   const board = await ScoreApi.getLeaderboard({ mode: 'robot', limit: 10 });
 */
(function (root) {
    const ENDPOINT = '/api/scores';

    async function postJson(path, body) {
        const res = await fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`saveScore failed (${res.status}): ${text}`);
        }
        return res.json();
    }

    async function getJson(path) {
        const res = await fetch(path);
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`request failed (${res.status}): ${text}`);
        }
        return res.json();
    }

    function buildQuery(params) {
        const q = new URLSearchParams();
        Object.entries(params || {}).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
        });
        const s = q.toString();
        return s ? `?${s}` : '';
    }

    const ScoreApi = {
        saveScore(payload) {
            return postJson(ENDPOINT, payload);
        },
        getScores({ studentName, mode, limit } = {}) {
            return getJson(`${ENDPOINT}${buildQuery({ studentName, mode, limit })}`);
        },
        getLeaderboard({ mode, limit } = {}) {
            return getJson(`${ENDPOINT}${buildQuery({ view: 'leaderboard', mode, limit })}`);
        },
    };

    root.ScoreApi = ScoreApi;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ScoreApi;
    }
})(typeof window !== 'undefined' ? window : globalThis);
