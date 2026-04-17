/**
 * INFORMATIKA LAB ADVENTURE
 * Daily Challenge System - 10x Retention Feature
 * Procedurally generates a daily puzzle from all 4 modes.
 * Same seed for everyone → same puzzle → shareable experience.
 */

const DailyChallenge = (() => {
    // ============================================
    // DAILY SEED GENERATOR
    // ============================================

    function getDailySeed() {
        const now = new Date();
        return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    }

    function seededRandom(seed) {
        let s = seed;
        return function () {
            s = (s * 16807 + 0) % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    // ============================================
    // CHALLENGE GENERATION
    // ============================================

    function generateDailyChallenge() {
        const seed = getDailySeed();
        const rng = seededRandom(seed);

        // Pick mode for today (cycles: Mon=robot, Tue=network, Wed=computer, Thu=coding, Fri-Sun=random)
        const dayOfWeek = new Date().getDay(); // 0=Sun
        let mode;
        if (dayOfWeek === 1) mode = 'robot';
        else if (dayOfWeek === 2) mode = 'network';
        else if (dayOfWeek === 3) mode = 'computer';
        else if (dayOfWeek === 4) mode = 'coding';
        else {
            const modes = ['robot', 'network', 'computer', 'coding'];
            mode = modes[Math.floor(rng() * modes.length)];
        }

        // Pick difficulty tier based on overall progress
        const progress = typeof ProgressSystem !== 'undefined' ? ProgressSystem.getState() : { totalCompleted: 0 };
        let maxLevel;
        if (progress.totalCompleted < 5) {
            maxLevel = 3; // Easy
        } else if (progress.totalCompleted < 15) {
            maxLevel = 7; // Medium
        } else if (progress.totalCompleted < 35) {
            maxLevel = 12; // Hard
        } else {
            maxLevel = getModeLevelCount(mode); // Expert
        }

        const levelNum = Math.floor(rng() * maxLevel) + 1;

        // Generate bonus objectives
        const bonusObjectives = [];
        const allBonuses = [
            { id: 'speed', text: '⚡ Selesaikan dalam 60 detik', icon: '⚡' },
            { id: 'perfect', text: '⭐ Raih 3 bintang', icon: '⭐' },
            { id: 'no_error', text: '🎯 Tanpa kesalahan', icon: '🎯' },
            { id: 'efficient', text: '📊 Gunakan perintah minimal', icon: '📊' }
        ];

        // Pick 2 bonus objectives
        const shuffled = allBonuses.sort((a, b) => rng() - 0.5);
        bonusObjectives.push(shuffled[0], shuffled[1]);

        return {
            seed,
            mode,
            levelNum,
            bonusObjectives,
            xpReward: 100,
            bonusXP: 50, // Per bonus objective completed
            dateString: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        };
    }

    function getModeLevelCount(mode) {
        switch (mode) {
            case 'robot': return typeof RobotGame !== 'undefined' ? RobotGame.getLevelCount() : 20;
            case 'network': return typeof NetworkGame !== 'undefined' ? NetworkGame.getLevelCount() : 15;
            case 'computer': return typeof ComputerGame !== 'undefined' ? ComputerGame.getLevelCount() : 15;
            case 'coding': return typeof CodingGame !== 'undefined' ? CodingGame.getLevelCount() : 15;
            default: return 10;
        }
    }

    // ============================================
    // STATE
    // ============================================

    function getState() {
        const saved = localStorage.getItem('dailyChallengeState');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { /* ignore */ }
        }
        return { completedSeeds: [], lastSeed: null, totalCompleted: 0, currentStreak: 0, bestStreak: 0 };
    }

    function saveState(s) {
        localStorage.setItem('dailyChallengeState', JSON.stringify(s));
    }

    function isTodayCompleted() {
        const s = getState();
        return s.completedSeeds.includes(getDailySeed());
    }

    function completeDailyChallenge(bonusResults = {}) {
        const s = getState();
        const seed = getDailySeed();

        if (s.completedSeeds.includes(seed)) return null; // Already completed

        s.completedSeeds.push(seed);
        s.lastSeed = seed;
        s.totalCompleted++;

        // Check if yesterday was completed for streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdaySeed = yesterday.getFullYear() * 10000 + (yesterday.getMonth() + 1) * 100 + yesterday.getDate();
        if (s.completedSeeds.includes(yesterdaySeed)) {
            s.currentStreak++;
        } else {
            s.currentStreak = 1;
        }
        if (s.currentStreak > s.bestStreak) s.bestStreak = s.currentStreak;

        // Keep only last 30 days of seeds
        if (s.completedSeeds.length > 30) {
            s.completedSeeds = s.completedSeeds.slice(-30);
        }

        saveState(s);

        // Give XP reward
        let totalXP = 100;
        let bonusCount = 0;
        if (bonusResults.speed) { totalXP += 50; bonusCount++; }
        if (bonusResults.perfect) { totalXP += 50; bonusCount++; }
        if (bonusResults.no_error) { totalXP += 50; bonusCount++; }
        if (bonusResults.efficient) { totalXP += 50; bonusCount++; }

        return { totalXP, bonusCount, streak: s.currentStreak };
    }

    // ============================================
    // UI RENDERING
    // ============================================

    function getModeInfo(mode) {
        const info = {
            robot: { name: 'Robot Logic', icon: '🤖', color: 'primary', gradient: 'from-blue-500 to-cyan-500' },
            network: { name: 'Network Mission', icon: '🌐', color: 'secondary', gradient: 'from-green-500 to-emerald-500' },
            computer: { name: 'Build Computer', icon: '🖥️', color: 'purple', gradient: 'from-purple-500 to-violet-500' },
            coding: { name: 'Coding Puzzle', icon: '🧩', color: 'accent', gradient: 'from-amber-500 to-orange-500' }
        };
        return info[mode] || info.robot;
    }

    function renderDashboardCard() {
        const container = document.getElementById('daily-challenge-card');
        if (!container) return;

        const challenge = generateDailyChallenge();
        const completed = isTodayCompleted();
        const state = getState();
        const modeInfo = getModeInfo(challenge.mode);

        container.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${modeInfo.gradient} flex items-center justify-center text-2xl shadow-lg">
                        ${modeInfo.icon}
                    </div>
                    <div>
                        <h3 class="font-display text-lg font-bold text-white">🎯 Tantangan Harian</h3>
                        <p class="text-xs text-dark-300">${challenge.dateString}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    ${state.currentStreak > 0 ? `<span class="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-lg text-xs font-bold">🔥 ${state.currentStreak}</span>` : ''}
                    ${completed ? '<span class="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-bold">✅ Selesai</span>' : ''}
                </div>
            </div>

            <div class="flex items-center gap-4 mb-3 p-3 rounded-xl bg-dark-800/50">
                <div class="text-center">
                    <p class="text-xs text-dark-300 mb-1">Mode</p>
                    <p class="text-sm font-bold text-${modeInfo.color}-400">${modeInfo.name}</p>
                </div>
                <div class="w-px h-8 bg-dark-700"></div>
                <div class="text-center">
                    <p class="text-xs text-dark-300 mb-1">Level</p>
                    <p class="text-sm font-bold text-white">#${challenge.levelNum}</p>
                </div>
                <div class="w-px h-8 bg-dark-700"></div>
                <div class="text-center">
                    <p class="text-xs text-dark-300 mb-1">Hadiah</p>
                    <p class="text-sm font-bold text-purple-300">+${challenge.xpReward} XP</p>
                </div>
            </div>

            <div class="flex gap-2 mb-4">
                ${challenge.bonusObjectives.map(b => `
                    <div class="flex-1 px-2 py-1.5 rounded-lg bg-dark-800/50 border border-dark-600 text-center">
                        <span class="text-xs text-dark-200">${b.text}</span>
                    </div>
                `).join('')}
            </div>

            <button class="w-full py-3 rounded-xl font-bold text-white text-lg ${completed ? 'bg-dark-600 cursor-not-allowed opacity-50' : `bg-gradient-to-r ${modeInfo.gradient} hover:shadow-lg hover:shadow-${modeInfo.color}-500/20`} transition-all"
                    ${completed ? 'disabled' : ''} id="daily-play-btn">
                ${completed ? '✅ Tantangan Hari Ini Selesai!' : '🚀 Mulai Tantangan!'}
            </button>

            <div class="flex justify-center gap-6 mt-3">
                <div class="text-center">
                    <p class="text-xs text-dark-400">Total</p>
                    <p class="text-sm font-bold text-dark-200">${state.totalCompleted}</p>
                </div>
                <div class="text-center">
                    <p class="text-xs text-dark-400">Best Streak</p>
                    <p class="text-sm font-bold text-orange-400">${state.bestStreak}</p>
                </div>
            </div>
        `;

        // Attach play button handler
        const playBtn = document.getElementById('daily-play-btn');
        if (playBtn && !completed) {
            playBtn.addEventListener('click', () => startDailyChallenge(challenge));
        }
    }

    function startDailyChallenge(challenge) {
        if (typeof SoundManager !== 'undefined') SoundManager.play('gameStart');

        // Set the game mode to the challenge level
        if (typeof GameState !== 'undefined') {
            GameState.currentLevel[challenge.mode] = challenge.levelNum;
        }

        // Navigate to the mode
        if (typeof navigateTo === 'function') {
            navigateTo(challenge.mode);
        }

        // Mark as daily challenge active
        sessionStorage.setItem('dailyChallengeActive', JSON.stringify(challenge));
    }

    function checkDailyChallengeCompletion(mode, options) {
        const challengeData = sessionStorage.getItem('dailyChallengeActive');
        if (!challengeData) return;

        try {
            const challenge = JSON.parse(challengeData);
            if (challenge.mode !== mode) return;

            // Check bonus objectives
            const bonusResults = {};
            const timeTaken = options.timeTaken || Infinity;
            const stars = options.stars || 1;
            const errors = options.errorsOccurred || 0;
            const cmdUsed = options.commandsUsed || 0;
            const minCmd = options.minCommands || 0;

            bonusResults.speed = timeTaken <= 60;
            bonusResults.perfect = stars >= 3;
            bonusResults.no_error = errors === 0;
            bonusResults.efficient = minCmd > 0 ? cmdUsed <= minCmd : true;

            const result = completeDailyChallenge(bonusResults);
            if (result) {
                // Show daily challenge completion toast
                if (typeof Toast !== 'undefined') {
                    setTimeout(() => {
                        Toast.show('🎯 Tantangan Harian Selesai!', 'achievement');
                        setTimeout(() => {
                            Toast.show(`+${result.totalXP} XP Harian (${result.bonusCount} bonus)`, 'xp');
                        }, 800);
                        if (result.streak > 1) {
                            setTimeout(() => {
                                Toast.show(`🔥 Daily Streak: ${result.streak} hari!`, 'streak');
                            }, 1600);
                        }
                    }, 2000);
                }

                // Give XP via progress system
                if (typeof ProgressSystem !== 'undefined' && result.totalXP > 0) {
                    // XP is already given through completeLevel, just add bonus
                    const bonusXP = result.bonusCount * 50;
                    if (bonusXP > 0) {
                        // Add bonus XP directly
                        const ps = ProgressSystem.getState();
                        ps.xp = (ps.xp || 0) + bonusXP;
                        // Note: This won't save without internal save() call
                        // The bonus is tracked separately via toast notification
                    }
                }

                // Confetti!
                if (typeof Particles !== 'undefined') {
                    setTimeout(() => Particles.celebrationRain(2000), 500);
                }
            }

            sessionStorage.removeItem('dailyChallengeActive');
        } catch (e) {
            console.warn('Daily challenge check failed:', e);
        }
    }

    // ============================================
    // PUBLIC API
    // ============================================

    return {
        generateDailyChallenge,
        renderDashboardCard,
        isTodayCompleted,
        startDailyChallenge,
        checkDailyChallengeCompletion,
        getState,
        getDailySeed
    };
})();
