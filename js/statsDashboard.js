/**
 * INFORMATIKA LAB ADVENTURE
 * Stats Dashboard - 10x Engagement Feature
 * Comprehensive stats showing total time, accuracy, efficiency,
 * per-mode breakdown, and learning journey visualization
 */

const StatsDashboard = (() => {
    // ============================================
    // TIME TRACKING
    // ============================================

    function getPlaytimeState() {
        const saved = localStorage.getItem('playtimeData');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { /* ignore */ }
        }
        return {
            totalSeconds: 0,
            sessionStart: null,
            sessions: 0,
            modeTime: { robot: 0, network: 0, computer: 0, coding: 0 },
            levelsAttempted: 0,
            levelsCompleted: 0,
            totalErrors: 0,
            totalHints: 0,
            fastestLevel: null, // { mode, level, time }
            lastUpdated: null
        };
    }

    function savePlaytime(s) {
        s.lastUpdated = Date.now();
        localStorage.setItem('playtimeData', JSON.stringify(s));
    }

    function startSession() {
        const s = getPlaytimeState();
        s.sessionStart = Date.now();
        s.sessions++;
        savePlaytime(s);
    }

    function tickSession() {
        const s = getPlaytimeState();
        if (s.sessionStart) {
            const elapsed = Math.floor((Date.now() - s.sessionStart) / 1000);
            s.totalSeconds += elapsed;
            s.sessionStart = Date.now(); // Reset for next tick
            savePlaytime(s);
        }
    }

    function recordLevelAttempt(mode) {
        const s = getPlaytimeState();
        s.levelsAttempted++;
        savePlaytime(s);
    }

    function recordLevelComplete(mode, timeTaken, errors, hints) {
        const s = getPlaytimeState();
        s.levelsCompleted++;
        s.modeTime[mode] = (s.modeTime[mode] || 0) + Math.round(timeTaken);
        s.totalErrors += errors || 0;
        s.totalHints += hints || 0;

        // Track fastest level
        if (!s.fastestLevel || timeTaken < s.fastestLevel.time) {
            s.fastestLevel = { mode, time: Math.round(timeTaken) };
        }

        savePlaytime(s);
    }

    // ============================================
    // STATS CALCULATIONS
    // ============================================

    function getAccuracy() {
        const s = getPlaytimeState();
        if (s.levelsAttempted === 0) return 100;
        return Math.round((s.levelsCompleted / s.levelsAttempted) * 100);
    }

    function getFavoriteMode() {
        const s = getPlaytimeState();
        const p = typeof ProgressSystem !== 'undefined' ? ProgressSystem.getState() : {};
        const modes = {
            robot: p.robotCompleted || 0,
            network: p.networkCompleted || 0,
            computer: p.computerCompleted || 0,
            coding: p.codingCompleted || 0
        };

        let max = 0;
        let fav = null;
        for (const [mode, count] of Object.entries(modes)) {
            if (count > max) { max = count; fav = mode; }
        }
        return fav;
    }

    function getAverageStars() {
        if (typeof ProgressSystem === 'undefined') return 0;
        const ps = ProgressSystem.getState();
        const ratings = ps.starRatings || {};
        const values = Object.values(ratings);
        if (values.length === 0) return 0;
        return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    }

    function formatTime(seconds) {
        if (seconds < 60) return `${seconds}d`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}d`;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}j ${m}m`;
    }

    // ============================================
    // RENDER STATS PANEL
    // ============================================

    function renderDashboardStats() {
        const container = document.getElementById('stats-dashboard-card');
        if (!container) return;

        const s = getPlaytimeState();
        const accuracy = getAccuracy();
        const favMode = getFavoriteMode();
        const avgStars = getAverageStars();
        const ps = typeof ProgressSystem !== 'undefined' ? ProgressSystem.getState() : {};

        const modeNames = { robot: 'Robot Logic', network: 'Network Mission', computer: 'Build Computer', coding: 'Coding Puzzle' };
        const modeIcons = {
            robot: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="8" width="10" height="8" rx="2"/><path d="M12 4v3M9 12h.01M15 12h.01"/></svg>',
            network: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M12 7v5m0 0-7 4m7-4 7 4"/></svg>',
            computer: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
            coding: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 8-4 4 4 4m8-8 4 4-4 4"/></svg>'
        };
        const modeColors = { robot: '#0ea5e9', network: '#22c55e', computer: '#8b5cf6', coding: '#f59e0b' };

        // Per-mode star stats
        const modeStats = ['robot', 'network', 'computer', 'coding'].map(mode => {
            const totalLevels = { robot: 20, network: 17, computer: 15, coding: 15 }[mode];
            const completed = typeof GameState !== 'undefined' ? GameState.progress[mode].completed : 0;
            let stars = 0;
            if (typeof ProgressSystem !== 'undefined') {
                stars = ProgressSystem.getTotalStars(mode);
            }
            const maxStars = totalLevels * 3;
            const pct = totalLevels > 0 ? Math.round((completed / totalLevels) * 100) : 0;
            return { mode, name: modeNames[mode], color: modeColors[mode], completed, totalLevels, stars, maxStars, pct };
        });

        container.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-display text-lg font-bold text-white flex items-center gap-2">Statistik Perjalanan</h3>
                <span class="text-xs text-dark-400">${s.sessions} sesi</span>
            </div>

            <!-- Key Stats Row -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div class="rounded-xl bg-dark-800/60 p-3 text-center border border-dark-700">
                    <p class="text-2xl font-bold text-primary-400">${formatTime(s.totalSeconds)}</p>
                    <p class="text-[10px] text-dark-300 mt-1">Waktu Bermain</p>
                </div>
                <div class="rounded-xl bg-dark-800/60 p-3 text-center border border-dark-700">
                    <p class="text-2xl font-bold ${accuracy >= 80 ? 'text-green-400' : accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'}">${accuracy}%</p>
                    <p class="text-[10px] text-dark-300 mt-1">Akurasi</p>
                </div>
                <div class="rounded-xl bg-dark-800/60 p-3 text-center border border-dark-700">
                    <p class="text-2xl font-bold text-yellow-400">Bintang ${avgStars}</p>
                    <p class="text-[10px] text-dark-300 mt-1">Rata-rata Bintang</p>
                </div>
                <div class="rounded-xl bg-dark-800/60 p-3 text-center border border-dark-700">
                    <p class="text-2xl font-bold text-purple-400">${ps.totalCompleted || 0}</p>
                    <p class="text-[10px] text-dark-300 mt-1">Level Selesai</p>
                </div>
            </div>

            <!-- Per-mode breakdown -->
            <div class="space-y-2 mb-4">
                ${modeStats.map(m => `
                    <div class="flex items-center gap-3 p-2 rounded-lg bg-dark-800/40">
                        <span class="text-lg w-8" aria-hidden="true" style="color:${m.color}">${modeIcons[m.mode]}</span>
                        <div class="flex-1">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-xs font-medium text-dark-200">${m.name}</span>
                                <span class="text-xs text-dark-400">${m.completed}/${m.totalLevels} · Bintang ${m.stars}/${m.maxStars}</span>
                            </div>
                            <div class="w-full h-1.5 rounded-full bg-dark-700 overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-700" style="width: ${m.pct}%; background: ${m.color};"></div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Fun Facts -->
            <div class="flex flex-wrap gap-2 justify-center text-xs">
                ${favMode ? `<span class="px-3 py-1 rounded-full bg-dark-800/60 border border-dark-600 text-dark-200">Mode Favorit: ${modeNames[favMode] || '?'}</span>` : ''}
                ${s.fastestLevel ? `<span class="px-3 py-1 rounded-full bg-dark-800/60 border border-dark-600 text-dark-200">Tercepat: ${s.fastestLevel.time}d</span>` : ''}
                ${(ps.maxStreak || 0) > 0 ? `<span class="px-3 py-1 rounded-full bg-dark-800/60 border border-dark-600 text-dark-200">Best Streak: ${ps.maxStreak}</span>` : ''}
                <span class="px-3 py-1 rounded-full bg-dark-800/60 border border-dark-600 text-dark-200">Hint: ${s.totalHints}x</span>
            </div>
        `;

        // Animate bars
        if (typeof anime !== 'undefined') {
            anime({
                targets: container.querySelectorAll('.h-1\\.5 > div'),
                width: function(el) { return el.style.width; },
                duration: 800,
                delay: anime.stagger(100),
                easing: 'easeOutQuart'
            });
        }
    }

    // ============================================
    // PUBLIC API
    // ============================================

    return {
        startSession,
        tickSession,
        recordLevelAttempt,
        recordLevelComplete,
        renderDashboardStats,
        getAccuracy,
        getFavoriteMode,
        getAverageStars,
        formatTime,
        getPlaytimeState
    };
})();
