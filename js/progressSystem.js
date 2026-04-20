/**
 * INFORMATIKA LAB ADVENTURE
 * Progress System - XP, Star Ratings, Achievements, Streaks
 * Enhanced progression with motivational feedback
 */

const ProgressSystem = (() => {
    // ============================================
    // XP & LEVEL CONFIG
    // ============================================

    const XP_PER_STAR = 25;
    const XP_PER_LEVEL_COMPLETE = 50;
    const XP_PERFECT_BONUS = 30;
    const XP_STREAK_BONUS = 15; // per streak level
    const LEVELS_XP = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 5000, 6200, 7600, 9200, 11000];
    const LEVEL_TITLES = [
        'Pemula', 'Pelajar', 'Explorer', 'Coder Muda', 'Problem Solver',
        'Teknisi', 'Hacker Baik', 'Algoritma Ninja', 'Master Builder',
        'Network Wizard', 'Coding Samurai', 'Digital Architect',
        'Cyber Hero', 'Tech Genius', 'Informatika Legend', 'Supreme Master'
    ];

    // ============================================
    // ACHIEVEMENT DEFINITIONS
    // ============================================

    const MEDAL_BASE = 'assets/kenney_medals/PNG';

    const ACHIEVEMENTS = [
        { id: 'first_level', name: 'Langkah Pertama', desc: 'Selesaikan level pertamamu!', icon: 'Belajar', medal: `${MEDAL_BASE}/flatshadow_medal1.png`, condition: (s) => s.totalCompleted >= 1 },
        { id: 'first_star3', name: 'Bintang Emas', desc: 'Dapat 3 bintang di satu level!', icon: 'Bintang', medal: `${MEDAL_BASE}/flatshadow_medal2.png`, condition: (s) => s.perfectLevels >= 1 },
        { id: 'robot_master', name: 'Robot Whisperer', desc: 'Selesaikan semua level Robot!', icon: 'Robot', medal: `${MEDAL_BASE}/flatshadow_medal3.png`, condition: (s) => s.robotCompleted >= 20 },
        { id: 'network_master', name: 'Network Guru', desc: 'Selesaikan semua level Network!', icon: 'Network', medal: `${MEDAL_BASE}/flatshadow_medal4.png`, condition: (s) => s.networkCompleted >= 17 },
        { id: 'computer_master', name: 'Master Builder', desc: 'Selesaikan semua level Computer!', icon: 'Computer', medal: `${MEDAL_BASE}/flatshadow_medal5.png`, condition: (s) => s.computerCompleted >= 15 },
        { id: 'coding_master', name: 'Code Ninja', desc: 'Selesaikan semua level Coding!', icon: 'Puzzle', medal: `${MEDAL_BASE}/flatshadow_medal6.png`, condition: (s) => s.codingCompleted >= 15 },
        { id: 'five_streak', name: 'On Fire!', desc: 'Raih streak 5 level berturut-turut!', icon: 'Streak', medal: `${MEDAL_BASE}/flatshadow_medal7.png`, condition: (s) => s.maxStreak >= 5 },
        { id: 'ten_streak', name: 'Unstoppable!', desc: 'Raih streak 10 level berturut-turut!', icon: 'Maksimal', medal: `${MEDAL_BASE}/flatshadow_medal8.png`, condition: (s) => s.maxStreak >= 10 },
        { id: 'xp_500', name: 'XP Hunter', desc: 'Kumpulkan 500 XP!', icon: 'XP', medal: `${MEDAL_BASE}/flatshadow_medal1.png`, condition: (s) => s.totalXP >= 500 },
        { id: 'xp_2000', name: 'XP Maniac', desc: 'Kumpulkan 2000 XP!', icon: 'XP', medal: `${MEDAL_BASE}/flatshadow_medal2.png`, condition: (s) => s.totalXP >= 2000 },
        { id: 'all_modes', name: 'Explorer', desc: 'Coba semua 4 mode permainan!', icon: 'Explorer', medal: `${MEDAL_BASE}/flatshadow_medal3.png`, condition: (s) => s.modesPlayed >= 4 },
        { id: 'speed_demon', name: 'Speed Demon', desc: 'Selesaikan 3 level dalam 5 menit!', icon: 'Simulasi', medal: `${MEDAL_BASE}/flatshadow_medal4.png`, condition: (s) => s.speedLevels >= 3 },
        { id: 'no_hint', name: 'No Help Needed', desc: 'Selesaikan 5 level tanpa hint!', icon: 'Algoritma', medal: `${MEDAL_BASE}/flatshadow_medal5.png`, condition: (s) => s.noHintLevels >= 5 },
        { id: 'perfect_ten', name: 'Perfect 10', desc: '10 level dengan 3 bintang!', icon: 'Prestasi', medal: `${MEDAL_BASE}/flatshadow_medal8.png`, condition: (s) => s.perfectLevels >= 10 },
        { id: 'completionist', name: 'Completionist', desc: 'Selesaikan SEMUA level!', icon: 'Master', medal: `${MEDAL_BASE}/flatshadow_medal9.png`, condition: (s) => s.totalCompleted >= 65 }
    ];

    // ============================================
    // STATE
    // ============================================

    let state = {
        xp: 0,
        level: 0,
        streak: 0,
        maxStreak: 0,
        totalCompleted: 0,
        perfectLevels: 0,
        speedLevels: 0,
        noHintLevels: 0,
        modesPlayed: 0,
        modesPlayedSet: [],
        robotCompleted: 0,
        networkCompleted: 0,
        computerCompleted: 0,
        codingCompleted: 0,
        unlockedAchievements: [],
        starRatings: {}, // e.g., { 'robot_1': 3, 'network_2': 2 }
        lastPlayDate: null,
        dailyStreak: 0,
        levelStartTime: null,
        hintsUsedThisLevel: 0
    };

    // ============================================
    // PERSISTENCE
    // ============================================

    function save() {
        localStorage.setItem('progressSystemData', JSON.stringify(state));
    }

    function load() {
        const saved = localStorage.getItem('progressSystemData');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
            } catch (e) {
                console.warn('Failed to load progress system data');
            }
        }
    }

    // ============================================
    // XP & LEVEL CALCULATIONS
    // ============================================

    function getLevel() {
        for (let i = LEVELS_XP.length - 1; i >= 0; i--) {
            if (state.xp >= LEVELS_XP[i]) return i;
        }
        return 0;
    }

    function getXPForNextLevel() {
        const lvl = getLevel();
        if (lvl >= LEVELS_XP.length - 1) return state.xp; // max level
        return LEVELS_XP[lvl + 1];
    }

    function getXPProgress() {
        const lvl = getLevel();
        const currentLvlXP = LEVELS_XP[lvl];
        const nextLvlXP = LEVELS_XP[Math.min(lvl + 1, LEVELS_XP.length - 1)];
        const range = nextLvlXP - currentLvlXP;
        if (range <= 0) return 1;
        return (state.xp - currentLvlXP) / range;
    }

    function getLevelTitle() {
        return LEVEL_TITLES[getLevel()] || LEVEL_TITLES[LEVEL_TITLES.length - 1];
    }

    // ============================================
    // STAR RATING CALCULATOR
    // ============================================

    function calculateStars(mode, levelNum, options = {}) {
        const { timeTaken = Infinity, hintsUsed = 0, commandsUsed = 0, minCommands = 0, errorsOccurred = 0 } = options;
        let stars = 1; // Base: completed = 1 star

        // Star 2: No errors / efficient solution
        if (errorsOccurred === 0) stars++;
        else if (minCommands > 0 && commandsUsed <= minCommands * 1.5) stars++;

        // Star 3: Perfect - no hints, fast, efficient
        const isPerfect = hintsUsed === 0 && errorsOccurred === 0;
        const isEfficient = minCommands > 0 ? commandsUsed <= minCommands : true;
        if (isPerfect && isEfficient) stars++;

        stars = Math.min(3, Math.max(1, stars));
        return stars;
    }

    // ============================================
    // LEVEL COMPLETION HANDLER
    // ============================================

    function onLevelComplete(mode, levelNum, options = {}) {
        const key = `${mode}_${levelNum}`;
        const stars = calculateStars(mode, levelNum, options);
        const previousStars = state.starRatings[key] || 0;
        const isFirstTime = previousStars === 0;

        // Update star rating (keep best)
        if (stars > previousStars) {
            state.starRatings[key] = stars;
        }

        // Calculate XP
        let xpGained = 0;
        if (isFirstTime) {
            xpGained += XP_PER_LEVEL_COMPLETE;
            state.totalCompleted++;

            // Update mode-specific counter
            switch (mode) {
                case 'robot': state.robotCompleted++; break;
                case 'network': state.networkCompleted++; break;
                case 'computer': state.computerCompleted++; break;
                case 'coding': state.codingCompleted++; break;
            }
        }

        // XP for new stars
        const newStars = Math.max(0, stars - previousStars);
        xpGained += newStars * XP_PER_STAR;

        // Perfect bonus
        if (stars === 3 && previousStars < 3) {
            xpGained += XP_PERFECT_BONUS;
            state.perfectLevels++;
        }

        // Streak
        state.streak++;
        if (state.streak > state.maxStreak) state.maxStreak = state.streak;
        xpGained += Math.min(state.streak, 10) * XP_STREAK_BONUS;

        // Speed bonus tracking
        if (options.timeTaken && options.timeTaken < 100) { // 100 seconds
            state.speedLevels++;
        }

        // No-hint tracking
        if (options.hintsUsed === 0) {
            state.noHintLevels++;
        }

        // Track modes played
        if (!state.modesPlayedSet.includes(mode)) {
            state.modesPlayedSet.push(mode);
            state.modesPlayed = state.modesPlayedSet.length;
        }

        // Apply XP
        const prevLevel = getLevel();
        state.xp += xpGained;
        const newLevel = getLevel();

        // Check achievements
        const newAchievements = checkAchievements();

        // Save
        save();

        // Return result for UI
        return {
            stars,
            xpGained,
            totalXP: state.xp,
            isNewBest: stars > previousStars,
            isFirstTime,
            streak: state.streak,
            leveledUp: newLevel > prevLevel,
            newLevel: newLevel,
            levelTitle: getLevelTitle(),
            newAchievements,
            previousStars
        };
    }

    function onLevelFail() {
        state.streak = 0;
        save();
    }

    // ============================================
    // ACHIEVEMENT CHECKER
    // ============================================

    function checkAchievements() {
        const newlyUnlocked = [];
        ACHIEVEMENTS.forEach(ach => {
            if (!state.unlockedAchievements.includes(ach.id) && ach.condition(state)) {
                state.unlockedAchievements.push(ach.id);
                newlyUnlocked.push(ach);
            }
        });
        return newlyUnlocked;
    }

    // ============================================
    // LEVEL START TRACKING
    // ============================================

    function startLevel() {
        state.levelStartTime = Date.now();
        state.hintsUsedThisLevel = 0;
    }

    function useHint() {
        state.hintsUsedThisLevel++;
    }

    function getLevelTime() {
        if (!state.levelStartTime) return 0;
        return (Date.now() - state.levelStartTime) / 1000;
    }

    // ============================================
    // GETTERS
    // ============================================

    function getStars(mode, levelNum) {
        return state.starRatings[`${mode}_${levelNum}`] || 0;
    }

    function getTotalStars(mode) {
        let total = 0;
        Object.keys(state.starRatings).forEach(key => {
            if (key.startsWith(mode + '_')) total += state.starRatings[key];
        });
        return total;
    }

    function getAllAchievements() {
        return ACHIEVEMENTS.map(ach => ({
            ...ach,
            unlocked: state.unlockedAchievements.includes(ach.id)
        }));
    }

    function getState() {
        return { ...state };
    }

    function getStreak() {
        return state.streak;
    }

    // ============================================
    // DAILY STREAK
    // ============================================

    function checkDailyStreak() {
        const today = new Date().toDateString();
        if (state.lastPlayDate !== today) {
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (state.lastPlayDate === yesterday) {
                state.dailyStreak++;
            } else {
                state.dailyStreak = 1;
            }
            state.lastPlayDate = today;
            save();
        }
        return state.dailyStreak;
    }

    // ============================================
    // INIT
    // ============================================

    load();
    checkDailyStreak();

    return {
        onLevelComplete,
        onLevelFail,
        startLevel,
        useHint,
        getLevelTime,
        getStars,
        getTotalStars,
        getLevel,
        getXPForNextLevel,
        getXPProgress,
        getLevelTitle,
        getAllAchievements,
        getState,
        getStreak,
        checkDailyStreak,
        calculateStars,
        get xp() { return state.xp; },
        get level() { return getLevel(); },
        get streak() { return state.streak; },
        get dailyStreak() { return state.dailyStreak; },
        get totalCompleted() { return state.totalCompleted; },
        ACHIEVEMENTS
    };
})();
