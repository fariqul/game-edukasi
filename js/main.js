/**
 * INFORMATIKA LAB ADVENTURE
 * Main Controller - Navigation, Core Logic & Animations
 * Enhanced with XP, Stars, Sounds, Particles, Achievements
 */

// ============================================
// GAME STATE
// ============================================

const GameState = {
    currentScreen: 'dashboard',
    progress: {
        robot: { completed: 0, total: 20 },
        network: { completed: 0, total: 17 },
        computer: { completed: 0, total: 15 },
        coding: { completed: 0, total: 15 },
        circuit: { completed: 0, total: 3 }
    },
    currentLevel: {
        robot: 1,
        network: 1,
        computer: 1,
        coding: 1,
        circuit: 1
    }
};
let latestModeInitToken = 0;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lottie Manager first (needs to be ready for loading animations)
    if (typeof LottieManager !== 'undefined') {
        LottieManager.init();
        initLottieAnimations();
    }

    loadProgress();
    initNavigation();
    initModal();
    initSoundHooks();
    updateProgressDisplay();
    updateXPDisplay();
    updateAchievementGrid();
    updateDailyStreak();

    // Initialize Daily Challenge card
    if (typeof DailyChallenge !== 'undefined') {
        DailyChallenge.renderDashboardCard();
    }

    // Initialize Stats Dashboard
    if (typeof StatsDashboard !== 'undefined') {
        StatsDashboard.startSession();
        StatsDashboard.renderDashboardStats();
        // Tick session time every 30 seconds
        setInterval(() => StatsDashboard.tickSession(), 30000);
    }

    // Initialize character selection system
    if (typeof CharacterSystem !== 'undefined') {
        CharacterSystem.init();
    } else {
        animateDashboardEntrance();
    }

    // Preload mode pertama saat browser idle agar transisi klik pertama lebih cepat.
    if (typeof ModuleLoader !== 'undefined') {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => ModuleLoader.preload('robot'));
        } else {
            setTimeout(() => ModuleLoader.preload('robot'), 600);
        }
    }
});

// ============================================
// LOTTIE ANIMATIONS SETUP
// ============================================

function initLottieAnimations() {
    // Replace CSS loading spinner with Lottie spinner
    const loaderRing = document.getElementById('loader-ring-css');
    const loaderLottie = document.getElementById('loader-lottie');
    if (loaderLottie && loaderRing) {
        loaderRing.style.display = 'none';
        loaderLottie.style.display = 'block';
        LottieManager.create(loaderLottie, 'loading-spinner', {
            loop: true,
            autoplay: true,
            ariaLabel: 'Loading game...'
        });
    }

    // Dashboard streak fire animation (lazy loaded)
    const streakFireEl = document.getElementById('streak-fire-lottie');
    if (streakFireEl) {
        LottieManager.create(streakFireEl, 'streak-fire', {
            loop: true,
            autoplay: true,
            lazy: true,
            ariaLabel: 'Streak fire'
        });
    }

    // Dashboard trophy animation (shown when player has achievements)
    const trophyEl = document.getElementById('dashboard-trophy-lottie');
    if (trophyEl && typeof ProgressSystem !== 'undefined') {
        const achievements = ProgressSystem.getAllAchievements();
        const unlocked = achievements.filter(a => a.unlocked);
        if (unlocked.length > 0) {
            trophyEl.style.display = 'block';
            const emojiEl = document.getElementById('dashboard-emoji');
            if (emojiEl) emojiEl.style.display = 'none';
            LottieManager.create(trophyEl, 'trophy-pulse', {
                loop: true,
                autoplay: true,
                ariaLabel: 'Trophy'
            });
        }
    }

    // Modal streak fire
    const modalStreakFire = document.getElementById('modal-streak-fire');
    if (modalStreakFire) {
        LottieManager.create(modalStreakFire, 'streak-fire', {
            loop: true,
            autoplay: true,
            ariaLabel: 'Streak fire'
        });
    }

    // Mode card Lottie icons
    const modeIcons = {
        'mode-icon-network': 'network-icon',
        'mode-icon-computer': 'computer-icon',
        'mode-icon-coding': 'coding-icon'
    };
    Object.entries(modeIcons).forEach(([elId, animName]) => {
        const el = document.getElementById(elId);
        if (el) {
            LottieManager.create(el, animName, {
                loop: true,
                autoplay: true,
                lazy: true,
                ariaLabel: animName.replace('-', ' ')
            });
        }
    });
}

// ============================================
// DASHBOARD ANIMATIONS
// ============================================

function animateDashboardEntrance() {
    // Animate header
    anime({
        targets: '#dashboard header',
        translateY: [-30, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutQuart'
    });

    // Animate floating icon
    anime({
        targets: '#dashboard header .animate-float',
        scale: [0, 1],
        rotate: [-180, 0],
        duration: 1000,
        delay: 200,
        easing: 'easeOutElastic(1, .5)'
    });

    // Animate stats bar
    anime({
        targets: '#dashboard .glass-card',
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: 600,
        delay: 400,
        easing: 'easeOutQuart'
    });

    // Animate mode cards with stagger
    anime({
        targets: '.mode-card',
        translateY: [40, 0],
        opacity: [0, 1],
        scale: [0.9, 1],
        delay: anime.stagger(100, { start: 500 }),
        duration: 600,
        easing: 'easeOutQuart'
    });

    // Animate footer
    anime({
        targets: '#dashboard footer',
        opacity: [0, 1],
        duration: 800,
        delay: 900,
        easing: 'easeOutQuart'
    });
}

function animateProgressRings() {
    const modes = ['robot', 'network', 'computer', 'coding', 'circuit'];
    const circumference = 2 * Math.PI * 26; // r=26

    modes.forEach(mode => {
        const ring = document.getElementById(`progress-ring-${mode}`);
        if (!ring) return;

        const progress = GameState.progress[mode];
        const percentage = progress.completed / progress.total;
        const offset = circumference - (percentage * circumference);

        anime({
            targets: ring,
            strokeDashoffset: [circumference, offset],
            duration: 1000,
            delay: 800,
            easing: 'easeOutQuart'
        });
    });
}

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
    // Mode cards on dashboard
    document.querySelectorAll('.mode-card').forEach(card => {
        const mode = card.dataset.mode;

        // Hint preload saat user mulai berinteraksi dengan kartu mode.
        const preloadMode = () => {
            if (typeof ModuleLoader !== 'undefined' && mode) {
                ModuleLoader.preload(mode);
            }
        };
        card.addEventListener('mouseenter', preloadMode, { once: true });
        card.addEventListener('focus', preloadMode, { once: true });

        card.addEventListener('click', () => {
            // If multiplayer host, send game-start to opponent
            if (typeof Multiplayer !== 'undefined' && Multiplayer.isActive() && Multiplayer.isHostPlayer()) {
                Multiplayer.startMultiplayerMode(mode);
                return;
            }
            navigateTo(mode);
        });
    });

    // Back buttons
    document.querySelectorAll('[data-back]').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.back;
            navigateTo(target);
        });
    });
}

function navigateTo(screenId) {
    return new Promise((resolve) => {
    // Play navigation sound
    if (typeof SoundManager !== 'undefined') {
        SoundManager.play(screenId === 'dashboard' ? 'back' : 'navigate');
    }

    // Cleanup Lottie animations in current screen before transition
    const currentScreen = document.querySelector('.screen.active');
    if (typeof LottieManager !== 'undefined' && currentScreen) {
        LottieManager.destroyInScope('#' + currentScreen.id);
    }

    if (!currentScreen) {
        resolve();
        return;
    }

    anime({
        targets: currentScreen,
        opacity: [1, 0],
        translateY: [0, -20],
        duration: 300,
        easing: 'easeInQuart',
        complete: async () => {
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });

            // Show target screen
            let targetScreen;
            if (screenId === 'dashboard') {
                targetScreen = document.getElementById('dashboard');
                GameState.currentScreen = 'dashboard';
            } else {
                targetScreen = document.getElementById(`${screenId}-screen`);
                GameState.currentScreen = screenId;
                await initMode(screenId);
            }

            if (targetScreen) {
                targetScreen.classList.add('active');
                targetScreen.style.opacity = 0;

                // Animate in new screen
                anime({
                    targets: targetScreen,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 400,
                    easing: 'easeOutQuart'
                });
            }

            // Update progress when returning to dashboard
            if (screenId === 'dashboard') {
                updateProgressDisplay();
                animateProgressRings();
                updateXPDisplay();
                updateAchievementGrid();
                // Refresh 10x feature cards
                if (typeof DailyChallenge !== 'undefined') DailyChallenge.renderDashboardCard();
                if (typeof StatsDashboard !== 'undefined') StatsDashboard.renderDashboardStats();
                // Re-init Lottie dashboard animations
                if (typeof LottieManager !== 'undefined') {
                    initLottieAnimations();
                }
            }

            resolve();
        }
    });
    });
}

async function initMode(mode) {
    const initToken = ++latestModeInitToken;

    if (typeof ModuleLoader !== 'undefined') {
        try {
            await ModuleLoader.loadMode(mode);
        } catch (error) {
            console.error(error);
            if (typeof Toast !== 'undefined' && typeof Toast.show === 'function') {
                Toast.show(`Gagal memuat mode ${mode}. Coba refresh halaman.`, 'error');
            }
            return false;
        }
    }

    if (initToken !== latestModeInitToken) return false;

    // Reset hint panels to closed state
    resetHintPanels();

    // Start level timer for progress tracking
    if (typeof ProgressSystem !== 'undefined') {
        ProgressSystem.startLevel();
    }

    // Record level attempt for stats
    if (typeof StatsDashboard !== 'undefined') {
        StatsDashboard.recordLevelAttempt(mode);
    }

    // Record attempt for adaptive hints
    if (typeof AdaptiveHints !== 'undefined') {
        AdaptiveHints.recordAttempt(mode, GameState.currentLevel[mode]);
    }

    switch (mode) {
        case 'robot':
            if (typeof RobotGame !== 'undefined') {
                RobotGame.init(GameState.currentLevel.robot);
            }
            break;
        case 'network':
            if (typeof NetworkGame !== 'undefined') {
                NetworkGame.init(GameState.currentLevel.network);
            }
            break;
        case 'computer':
            if (typeof ComputerGame !== 'undefined') {
                ComputerGame.init(GameState.currentLevel.computer);
            }
            break;
        case 'coding':
            if (typeof CodingGame !== 'undefined') {
                CodingGame.init(GameState.currentLevel.coding);
            }
            break;
        case 'circuit':
            if (typeof CircuitGame !== 'undefined') {
                CircuitGame.init(GameState.currentLevel.circuit);
            }
            break;
    }

    return true;
}

// ============================================
// PROGRESS MANAGEMENT
// ============================================

function updateProgressDisplay() {
    // Update individual mode progress
    const modes = ['robot', 'network', 'computer', 'coding', 'circuit'];
    let totalCompleted = 0;
    let totalLevels = 0;

    modes.forEach(mode => {
        const progress = GameState.progress[mode];
        const display = document.getElementById(`progress-${mode}`);
        if (display) {
            display.textContent = `${progress.completed}/${progress.total}`;
        }
        totalCompleted += progress.completed;
        totalLevels += progress.total;
    });

    // Update total progress
    const totalProgress = document.getElementById('total-progress');
    if (totalProgress) {
        const percentage = Math.round((totalCompleted / totalLevels) * 100);
        totalProgress.textContent = `${percentage}%`;
    }

    // Update levels completed
    const levelsCompleted = document.getElementById('levels-completed');
    if (levelsCompleted) {
        levelsCompleted.textContent = `${totalCompleted}/${totalLevels}`;
    }

    // Update progress rings
    setTimeout(animateProgressRings, 100);
}

function completeLevel(mode, options) {
    const safeOptions = options || {};

    if (GameState.currentLevel[mode] > GameState.progress[mode].completed) {
        GameState.progress[mode].completed = GameState.currentLevel[mode];
    }
    saveProgress();

    // Record stats
    if (typeof StatsDashboard !== 'undefined') {
        StatsDashboard.recordLevelComplete(
            mode,
            safeOptions.timeTaken || 0,
            safeOptions.errorsOccurred || 0,
            safeOptions.hintsUsed || 0
        );
    }

    // Check daily challenge completion
    if (typeof DailyChallenge !== 'undefined') {
        DailyChallenge.checkDailyChallengeCompletion(mode, safeOptions);
    }

    // Reset adaptive hints attempts for this level (completed successfully)
    if (typeof AdaptiveHints !== 'undefined') {
        AdaptiveHints.resetAttempts(mode, GameState.currentLevel[mode]);
    }

    const levelNum = GameState.currentLevel[mode];

    // IN MABAR MODE: Skip UI popups (modal and info materi) and sync directly 
    const isMabar = typeof Multiplayer !== 'undefined' && Multiplayer.isActive();
    if (isMabar) {
        // Calculate result silently so they still get XP
        if (typeof ProgressSystem !== 'undefined') {
            const mabarResult = ProgressSystem.onLevelComplete(mode, levelNum, safeOptions);
            updateXPDisplay();
            updateAchievementGrid();
            if (typeof SoundManager !== 'undefined') SoundManager.play('levelComplete');
            
            // Provide non-intrusive feedback instead of a modal
            if (typeof Toast !== 'undefined') {
                Toast.success('Level Selesai! Menunggu pemain lain...', 3000);
                if (mabarResult) {
                    // Show small flyout indicators for XP/Stars instead of blocking the screen
                    setTimeout(() => Toast.showLevelResult(mabarResult), 500);
                }
            }
        }

        // Notify multiplayer opponent / bridge
        Multiplayer.onMyComplete();
        if (typeof Multiplayer.isClassBattleActive === 'function' && 
            Multiplayer.isClassBattleActive() && 
            typeof Multiplayer.onClassBattleComplete === 'function') {
            Multiplayer.onClassBattleComplete(mode, {
                ...safeOptions,
                reachedLevel: levelNum
            });
        }
        return; // EXIT EARLY: Skip modal
    }

    // NORMAL SOLO MODE: Show enhanced modal with stars, XP, achievements
    if (typeof ProgressSystem !== 'undefined') {
        showEnhancedModal(mode, levelNum, safeOptions);
    } else {
        showModal('Kamu berhasil menyelesaikan tantangan!');
    }
}

function advanceLevel(mode) {
    if (GameState.currentLevel[mode] < GameState.progress[mode].total) {
        GameState.currentLevel[mode]++;
        return true;
    }
    return false;
}

// ============================================
// LOCAL STORAGE
// ============================================

function saveProgress() {
    const data = {
        progress: GameState.progress,
        currentLevel: GameState.currentLevel
    };
    localStorage.setItem('informatikaLabProgress', JSON.stringify(data));
}

function loadProgress() {
    const saved = localStorage.getItem('informatikaLabProgress');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (typeof StateGuards !== 'undefined' && typeof StateGuards.normalizeGameState === 'function') {
                const normalized = StateGuards.normalizeGameState(data, GameState);
                GameState.progress = normalized.progress;
                GameState.currentLevel = normalized.currentLevel;
            } else {
                GameState.progress = data.progress || GameState.progress;
                GameState.currentLevel = data.currentLevel || GameState.currentLevel;
            }
        } catch (e) {
            console.warn('Failed to load progress:', e);
        }
    }
}

// ============================================
// MODAL
// ============================================

function initModal() {
    const modal = document.getElementById('success-modal');
    const btnNext = document.getElementById('btn-next-level');
    const btnBack = document.getElementById('btn-back-menu');

    btnNext.addEventListener('click', async () => {
        hideModal();
        const mode = GameState.currentScreen;
        if (advanceLevel(mode)) {
            await initMode(mode);
            updateLevelIndicator(mode);
        } else {
            navigateTo('dashboard');
        }
    });

    btnBack.addEventListener('click', () => {
        hideModal();
        navigateTo('dashboard');
    });
}

function showModal(message) {
    const modal = document.getElementById('success-modal');
    const messageEl = document.getElementById('success-message');
    messageEl.textContent = message || 'Kamu berhasil menyelesaikan tantangan!';

    // Reset star display for basic modal
    for (let i = 1; i <= 3; i++) {
        const starEl = document.getElementById(`modal-star-${i}`);
        if (starEl) { starEl.className = 'star-big empty-star'; }
    }
    const xpDisplay = document.getElementById('modal-xp-display');
    if (xpDisplay) xpDisplay.classList.add('hidden');
    const streakDisplay = document.getElementById('modal-streak-display');
    if (streakDisplay) streakDisplay.classList.add('hidden');

    // Show modal with animation
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    anime({
        targets: modal,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });

    anime({
        targets: '.modal-content',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 400,
        delay: 100,
        easing: 'easeOutBack'
    });

    // Confetti effect
    createConfetti();
}

function hideModal() {
    const modal = document.getElementById('success-modal');

    // Cleanup Lottie animations in modal
    if (typeof LottieManager !== 'undefined') {
        LottieManager.destroyInScope('#success-modal');
    }

    anime({
        targets: modal,
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInQuart',
        complete: () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    });
}

function createConfetti() {
    const colors = ['#0ea5e9', '#22c55e', '#8b5cf6', '#f59e0b', '#ec4899'];
    const modal = document.querySelector('.modal-content');

    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            top: 50%;
            left: 50%;
            pointer-events: none;
            z-index: 100;
        `;
        modal.appendChild(confetti);

        anime({
            targets: confetti,
            translateX: () => anime.random(-150, 150),
            translateY: () => anime.random(-150, 150),
            rotate: () => anime.random(-360, 360),
            scale: [1, 0],
            opacity: [1, 0],
            duration: 1000,
            delay: i * 20,
            easing: 'easeOutQuart',
            complete: () => confetti.remove()
        });
    }
}

function updateLevelIndicator(mode) {
    const indicator = document.getElementById(`${mode}-level`);
    if (indicator) {
        anime({
            targets: indicator,
            scale: [0.5, 1.2, 1],
            duration: 400,
            easing: 'easeOutBack'
        });
        indicator.textContent = GameState.currentLevel[mode];
    }
}

// ============================================
// HINT TOGGLE
// ============================================

function toggleHintPanel(btn) {
    const panel = btn.closest('.hint-panel');
    if (!panel) return;
    const content = panel.querySelector('.hint-content');
    if (!content) return;

    const isOpen = panel.classList.toggle('open');
    if (isOpen) {
        content.style.display = '';
        if (typeof anime !== 'undefined') {
            anime({ targets: content, opacity: [0, 1], translateY: [-8, 0], duration: 250, easing: 'easeOutQuart' });
        }
    } else {
        if (typeof anime !== 'undefined') {
            anime({ targets: content, opacity: [1, 0], translateY: [0, -8], duration: 200, easing: 'easeInQuart', complete: () => { content.style.display = 'none'; } });
        } else {
            content.style.display = 'none';
        }
    }
}

// Reset hint panels to closed when switching levels
function resetHintPanels() {
    document.querySelectorAll('.hint-panel.open').forEach(panel => {
        panel.classList.remove('open');
        const content = panel.querySelector('.hint-content');
        if (content) content.style.display = 'none';
    });
}

// ============================================
// FEEDBACK HELPERS
// ============================================

function showFeedback(elementId, message, isSuccess, allowHtml = false) {
    const feedback = document.getElementById(elementId);
    if (allowHtml) {
        feedback.innerHTML = typeof message === 'string' ? message : String(message ?? '');
    } else {
        feedback.textContent = message;
    }
    feedback.className = `mt-4 p-4 rounded-2xl text-center font-medium ${isSuccess ? 'feedback-success' : 'feedback-error'}`;

    // Animate feedback
    anime({
        targets: feedback,
        translateY: [10, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });

    // Auto hide after 4 seconds
    setTimeout(() => {
        anime({
            targets: feedback,
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuart',
            complete: () => {
                feedback.className = 'hidden mt-4 p-4 rounded-2xl text-center font-medium';
            }
        });
    }, 4000);
}

function hideFeedback(elementId) {
    const feedback = document.getElementById(elementId);
    feedback.className = 'hidden mt-4 p-4 rounded-2xl text-center font-medium';
}

// ============================================
// LEVEL NAVIGATION
// ============================================

async function goToPrevLevel(mode) {
    if (GameState.currentLevel[mode] > 1) {
        GameState.currentLevel[mode]--;
        await initMode(mode);
        updateLevelIndicator(mode);
    }
}

async function goToNextLevel(mode) {
    const maxLevel = GameState.progress[mode].completed + 1;
    const total = GameState.progress[mode].total;
    if (GameState.currentLevel[mode] < Math.min(maxLevel, total)) {
        GameState.currentLevel[mode]++;
        await initMode(mode);
        updateLevelIndicator(mode);
    }
}

async function resetToLevel1(mode) {
    GameState.currentLevel[mode] = 1;
    await initMode(mode);
    updateLevelIndicator(mode);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// SOUND HOOKS - Attach sounds to UI actions
// ============================================

function initSoundHooks() {
    // Sound on mode card hover
    document.querySelectorAll('.mode-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (typeof SoundManager !== 'undefined') SoundManager.play('hover');
        });
    });

    // Sound on button clicks
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof SoundManager !== 'undefined') SoundManager.play('click');
        });
    });
}

// ============================================
// XP & PROGRESS DISPLAY
// ============================================

function updateXPDisplay() {
    if (typeof ProgressSystem === 'undefined') return;

    const level = ProgressSystem.getLevel();
    const xp = ProgressSystem.xp;
    const nextXP = ProgressSystem.getXPForNextLevel();
    const progress = ProgressSystem.getXPProgress();
    const title = ProgressSystem.getLevelTitle();

    // Update dashboard XP panel
    const levelBadge = document.getElementById('player-level-badge');
    const levelTitle = document.getElementById('player-level-title');
    const levelNum = document.getElementById('player-level-num');
    const xpDisplay = document.getElementById('xp-display');
    const xpToNext = document.getElementById('xp-to-next');
    const xpBarFill = document.getElementById('xp-bar-fill');

    if (levelBadge) levelBadge.textContent = level;
    if (levelTitle) levelTitle.textContent = title;
    if (levelNum) levelNum.textContent = level;
    if (xpDisplay) xpDisplay.textContent = `${xp} XP`;
    if (xpToNext) xpToNext.textContent = nextXP - xp;
    if (xpBarFill) xpBarFill.style.width = `${Math.round(progress * 100)}%`;

    // Update streak
    const streakEl = document.getElementById('current-streak');
    if (streakEl) streakEl.textContent = ProgressSystem.getStreak();

    // Update total stars
    const totalStarsEl = document.getElementById('total-stars');
    if (totalStarsEl) {
        const total = ['robot', 'network', 'computer', 'coding', 'circuit'].reduce((sum, mode) => {
            return sum + ProgressSystem.getTotalStars(mode);
        }, 0);
        totalStarsEl.textContent = total;
    }
}

function updateDailyStreak() {
    if (typeof ProgressSystem === 'undefined') return;
    const daily = ProgressSystem.checkDailyStreak();
    const banner = document.getElementById('daily-streak-banner');
    const count = document.getElementById('daily-streak-count');
    if (banner && daily > 1) {
        banner.classList.remove('hidden');
        if (count) count.textContent = daily;
    }
}

// ============================================
// ACHIEVEMENT GRID
// ============================================

function achievementIconSvg(iconKey) {
    const map = {
        Belajar: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h11a3 3 0 0 1 3 3v9H7a3 3 0 0 0-3 3V6Z"/><path d="M18 9h2a2 2 0 0 1 0 4h-2"/></svg>',
        Bintang: '<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
        Robot: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="8" width="10" height="8" rx="2"/><path d="M12 4v3M9 12h.01M15 12h.01"/></svg>',
        Network: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M12 7v5m0 0-7 4m7-4 7 4"/></svg>',
        Computer: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
        Puzzle: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 8-4 4 4 4m8-8 4 4-4 4"/></svg>',
        Streak: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3c2 3 .8 5.5-1 7 3.2-.7 6 1.6 6 5 0 3.3-2.7 6-6 6s-6-2.7-6-6c0-3.1 2-5 4-6.5C8.3 6 9.4 4 12 3Z"/></svg>',
        Maksimal: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 4 3 6 6 .9-4.5 4.4 1 6.2L12 18.7l-5.5 2.8 1-6.2L3 10.9l6-.9L12 4Z"/></svg>',
        XP: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 7h5l-4 10h5m2-10 5 10M14.5 12h4"/></svg>',
        Explorer: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m12 8 2.5 3.5L12 16l-2.5-4.5L12 8Z"/></svg>',
        Simulasi: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h7l-2 8 9-12h-7l2-4"/></svg>',
        Algoritma: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h6m0 0-2-2m2 2-2 2M14 17h6m0 0-2-2m2 2-2 2"/><path d="M10 7h4v10h-4z"/></svg>',
        Prestasi: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3h8v4a4 4 0 0 1-8 0V3Z"/><path d="M6 7H4a3 3 0 0 0 3 3m8-3h2a3 3 0 0 1-3 3"/><path d="M12 11v4m-3 6h6"/></svg>',
        Master: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 4 3 6 6 .9-4.5 4.4 1 6.2L12 18.7l-5.5 2.8 1-6.2L3 10.9l6-.9L12 4Z"/></svg>'
    };
    return map[iconKey] || map.Belajar;
}

function updateAchievementGrid() {
    if (typeof ProgressSystem === 'undefined') return;

    const grid = document.getElementById('achievement-grid');
    const countEl = document.getElementById('achievement-count');
    if (!grid) return;

    const achievements = ProgressSystem.getAllAchievements();
    const unlocked = achievements.filter(a => a.unlocked).length;

    if (countEl) countEl.textContent = `${unlocked}/${achievements.length}`;

    grid.innerHTML = '';
    achievements.forEach(ach => {
        const card = document.createElement('div');
        card.className = `achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`;
        const medalImg = ach.medal
            ? `<img src="${ach.medal}" alt="${ach.name}" loading="lazy" decoding="async" class="medal-img ${ach.unlocked ? 'medal-unlocked' : 'medal-locked'}" draggable="false">`
            : `<div class="text-3xl mb-2">${achievementIconSvg(ach.icon)}</div>`;
        card.innerHTML = `
            <div class="medal-container">${medalImg}</div>
            <p class="text-xs font-bold text-white mb-1">${ach.name}</p>
            <p class="text-[0.6rem] text-slate-400">${ach.desc}</p>
        `;
        grid.appendChild(card);
    });
}

// ============================================
// ENHANCED LEVEL COMPLETE WITH STARS
// ============================================

function showEnhancedModal(mode, levelNum, options = {}) {
    // Calculate result via ProgressSystem
    let result = null;
    if (typeof ProgressSystem !== 'undefined') {
        result = ProgressSystem.onLevelComplete(mode, levelNum, options);
    }

    const modal = document.getElementById('success-modal');
    const messageEl = document.getElementById('success-message');

    // Celebration Lottie animation (replaces Sukses emoji)
    const celebrationEl = document.getElementById('modal-celebration-lottie');
    if (celebrationEl && typeof LottieManager !== 'undefined') {
        celebrationEl.innerHTML = '';
        LottieManager.playOneShot(celebrationEl, 'celebration', {
            ariaLabel: 'Celebration!',
            speed: 1.2
        });
    }

    // Stars animation with Lottie (replaces Bintang emoji)
    const stars = result ? result.stars : 1;
    for (let i = 1; i <= 3; i++) {
        const starEl = document.getElementById(`modal-star-${i}`);
        if (starEl) {
            starEl.className = 'star-big';
            starEl.innerHTML = '';
            starEl.style.width = '60px';
            starEl.style.height = '60px';

            if (i <= stars) {
                setTimeout(() => {
                    starEl.classList.add('revealed');
                    if (typeof LottieManager !== 'undefined') {
                        // Avoid playOneShot auto-destroy clearing the star after reveal.
                        const animId = LottieManager.create(starEl, 'star-reveal', {
                            autoplay: false,
                            loop: false,
                            ariaLabel: `Star ${i} earned`
                        });
                        setTimeout(() => LottieManager.play(animId, { speed: 1.1 }), 20);
                        // Freeze final visible state as static star so learners can read earned stars.
                        setTimeout(() => {
                            if (animId) LottieManager.destroy(animId);
                            starEl.innerHTML = '<svg viewBox="0 0 24 24" width="40" height="40" style="margin:10px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FFD700"/></svg>';
                        }, 1200);
                    }
                    if (typeof SoundManager !== 'undefined') SoundManager.play('starEarned');
                    if (typeof Particles !== 'undefined') {
                        const rect = starEl.getBoundingClientRect();
                        Particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
                    }
                }, 300 + i * 400);
            } else {
                starEl.classList.add('empty-star');
                starEl.innerHTML = '<svg viewBox="0 0 24 24" width="40" height="40" style="margin:10px;opacity:0.3;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#999"/></svg>';
            }
        }
    }

    // XP display
    const xpDisplay = document.getElementById('modal-xp-display');
    const xpAmount = document.getElementById('modal-xp-amount');
    if (result && result.xpGained > 0) {
        if (xpDisplay) xpDisplay.classList.remove('hidden');
        if (xpAmount) xpAmount.textContent = `+${result.xpGained} XP`;
    } else if (xpDisplay) {
        xpDisplay.classList.add('hidden');
    }

    // Streak display
    const streakDisplay = document.getElementById('modal-streak-display');
    const streakText = document.getElementById('modal-streak-text');
    if (result && result.streak > 1) {
        if (streakDisplay) streakDisplay.classList.remove('hidden');
        if (streakText) streakText.textContent = `Streak ${result.streak}x`;
    } else if (streakDisplay) {
        streakDisplay.classList.add('hidden');
    }

    // Message
    let msg = 'Kamu berhasil menyelesaikan tantangan!';
    if (result && result.isNewBest) msg = 'Skor terbaik baru!';
    if (result && stars === 3) msg = 'Sempurna! 3 Bintang!';
    if (messageEl) messageEl.textContent = msg;

    // Medal reveal for new achievements
    const medalContainer = document.getElementById('modal-medal-container');
    if (medalContainer) {
        if (result && result.newAchievements && result.newAchievements.length > 0) {
            medalContainer.classList.remove('hidden');
            medalContainer.innerHTML = result.newAchievements.map(ach => `
                <div class="modal-medal-reveal">
                    ${ach.medal ? `<img src="${ach.medal}" alt="${ach.name}" loading="lazy" decoding="async" class="medal-reveal-anim">` : `<span class="text-5xl">${achievementIconSvg(ach.icon)}</span>`}
                    <span class="text-sm font-bold text-yellow-300">${ach.name}</span>
                </div>
            `).join('');

            // Animate medal reveal
            setTimeout(() => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: '.medal-reveal-anim',
                        scale: [0, 1.2, 1],
                        rotate: ['-30deg', '10deg', '0deg'],
                        opacity: [0, 1],
                        duration: 800,
                        delay: anime.stagger(200, { start: 800 }),
                        easing: 'easeOutElastic(1, .5)'
                    });
                }
                if (typeof SoundManager !== 'undefined') SoundManager.play('achievement');
            }, 500);
        } else {
            medalContainer.classList.add('hidden');
            medalContainer.innerHTML = '';
        }
    }

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    anime({ targets: modal, opacity: [0, 1], duration: 300, easing: 'easeOutQuart' });
    anime({ targets: '.modal-content', scale: [0.8, 1], opacity: [0, 1], duration: 400, delay: 100, easing: 'easeOutBack' });

    // Particle celebration
    if (typeof Particles !== 'undefined') {
        setTimeout(() => Particles.celebrateCenter(60), 200);
        if (stars === 3) setTimeout(() => Particles.celebrationRain(1500), 500);
    }

    // Sound
    if (typeof SoundManager !== 'undefined') {
        SoundManager.play('levelComplete');
    }

    // Toast notifications
    if (typeof Toast !== 'undefined' && result) {
        setTimeout(() => Toast.showLevelResult(result), 1500);
    }

    // Update dashboard displays
    updateXPDisplay();
    updateAchievementGrid();

    // Show concept summary (educational reinforcement)
    if (typeof AdaptiveHints !== 'undefined') {
        AdaptiveHints.showConceptSummary(mode, levelNum);
    }

    // Confetti
    createConfetti();
}
