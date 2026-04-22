/**
 * INFORMATIKA LAB ADVENTURE
 * Level Select - Visual Level Map with Stars
 * 10x Feature: See all levels, jump to any unlocked level, see star ratings
 */

const LevelSelect = (() => {
    function getModeIcon(mode) {
        const icons = {
            robot: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="8" width="10" height="8" rx="2"/><path d="M12 4v3M9 12h.01M15 12h.01M5 16h14"/></svg>',
            network: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M12 7v5m0 0-7 4m7-4 7 4"/></svg>',
            computer: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
            coding: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 8-4 4 4 4m8-8 4 4-4 4"/></svg>'
        };
        return icons[mode] || icons.robot;
    }

    function getStarSvg(active) {
        return `<svg viewBox="0 0 24 24" width="10" height="10" ${active ? 'fill="#facc15"' : 'fill="none" stroke="#64748b" stroke-width="1.8"'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    }
    // ============================================
    // MODE CONFIG
    // ============================================

    const MODE_CONFIG = {
        robot: {
            name: 'Robot Logic Adventure',
            icon: 'Robot',
            color: '#0ea5e9',
            colorClass: 'primary',
            gradient: 'from-blue-500 to-cyan-500'
        },
        network: {
            name: 'Network Mission',
            icon: 'Network',
            color: '#22c55e',
            colorClass: 'secondary',
            gradient: 'from-green-500 to-emerald-500'
        },
        computer: {
            name: 'Build a Computer',
            icon: 'Computer',
            color: '#8b5cf6',
            colorClass: 'purple',
            gradient: 'from-purple-500 to-violet-500'
        },
        coding: {
            name: 'Coding Puzzle',
            icon: 'Puzzle',
            color: '#f59e0b',
            colorClass: 'accent',
            gradient: 'from-amber-500 to-orange-500'
        }
    };

    // ============================================
    // RENDER OVERLAY
    // ============================================

    function show(mode) {
        const config = MODE_CONFIG[mode];
        if (!config) return;

        const totalLevels = getTotalLevels(mode);
        const completed = typeof GameState !== 'undefined' ? GameState.progress[mode].completed : 0;

        // Build level grid items
        let levelsHTML = '';
        for (let i = 1; i <= totalLevels; i++) {
            const isUnlocked = i <= completed + 1;
            const isCompleted = i <= completed;
            const stars = typeof ProgressSystem !== 'undefined' ? ProgressSystem.getStars(mode, i) : 0;
            const isCurrent = typeof GameState !== 'undefined' && GameState.currentLevel[mode] === i;

            const starsHTML = isCompleted
                ? `<div class="flex gap-0.5 mt-1">${[1, 2, 3].map(s => `<span class="text-[10px]">${getStarSvg(s <= stars)}</span>`).join('')}</div>`
                : '';

            if (!isUnlocked) {
                levelsHTML += `
                    <div class="level-node locked relative flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-dark-800/80 border-2 border-dark-700 opacity-40 cursor-not-allowed">
                        <span class="text-dark-500 text-lg" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
                        </span>
                        <span class="text-[10px] text-dark-500 font-mono">${i}</span>
                    </div>`;
            } else if (isCompleted) {
                levelsHTML += `
                    <button class="level-node completed relative flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 transition-all hover:scale-110 cursor-pointer"
                        style="background: ${config.color}22; border-color: ${config.color}66;"
                        onclick="LevelSelect.selectLevel('${mode}', ${i})">
                        <span class="text-base font-bold" style="color: ${config.color}">${i}</span>
                        ${starsHTML}
                    </button>`;
            } else {
                levelsHTML += `
                    <button class="level-node current relative flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 transition-all hover:scale-110 cursor-pointer animate-pulse"
                        style="background: ${config.color}33; border-color: ${config.color}; box-shadow: 0 0 20px ${config.color}33;"
                        onclick="LevelSelect.selectLevel('${mode}', ${i})">
                        <span class="text-lg font-bold text-white">${i}</span>
                        <span class="text-[8px] text-dark-300">▶ PLAY</span>
                    </button>`;
            }
        }

        // Calculate total stars
        let totalStars = 0;
        let maxStars = totalLevels * 3;
        for (let i = 1; i <= totalLevels; i++) {
            totalStars += typeof ProgressSystem !== 'undefined' ? ProgressSystem.getStars(mode, i) : 0;
        }

        const overlay = document.getElementById('level-select-overlay');
        if (!overlay) return;

        overlay.innerHTML = `
            <div class="glass-card rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto border" style="border-color: ${config.color}33; box-shadow: 0 0 60px ${config.color}22;">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <span class="text-4xl" aria-hidden="true" style="color:${config.color}">${getModeIcon(mode)}</span>
                        <div>
                            <h2 class="font-display text-xl font-bold text-white">${config.name}</h2>
                            <p class="text-sm text-dark-300">${completed}/${totalLevels} selesai · Bintang ${totalStars}/${maxStars}</p>
                        </div>
                    </div>
                    <button class="w-10 h-10 rounded-xl bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-lg transition-colors" onclick="LevelSelect.close()">
                        X
                    </button>
                </div>

                <!-- Progress bar -->
                <div class="w-full h-3 rounded-full bg-dark-800 mb-6 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" style="width: ${(completed / totalLevels * 100)}%; background: ${config.color};"></div>
                </div>

                <!-- Level Grid -->
                <div class="grid grid-cols-5 gap-3 justify-items-center mb-4">
                    ${levelsHTML}
                </div>

                <!-- Legend -->
                <div class="flex justify-center gap-4 mt-4 text-xs text-dark-300">
                    <span class="flex items-center gap-1"><span class="w-3 h-3 rounded" style="background: ${config.color}44; border: 1px solid ${config.color}"></span> Selesai</span>
                    <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-dark-700 border border-dark-600 animate-pulse"></span> Saat ini</span>
                    <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-dark-800 border border-dark-700 opacity-40"></span> Terkunci</span>
                </div>
            </div>
        `;

        overlay.classList.remove('hidden');
        overlay.classList.add('flex');

        // Animate entrance
        if (typeof anime !== 'undefined') {
            anime({ targets: overlay, opacity: [0, 1], duration: 200, easing: 'easeOutQuart' });
            anime({ targets: overlay.querySelector('.glass-card'), scale: [0.9, 1], opacity: [0, 1], duration: 300, delay: 50, easing: 'easeOutBack' });
            anime({ targets: '.level-node', scale: [0, 1], delay: anime.stagger(30, { start: 150 }), duration: 300, easing: 'easeOutBack' });
        }

        if (typeof SoundManager !== 'undefined') SoundManager.play('navigate');
    }

    function close() {
        const overlay = document.getElementById('level-select-overlay');
        if (!overlay) return;

        if (typeof anime !== 'undefined') {
            anime({
                targets: overlay,
                opacity: [1, 0],
                duration: 200,
                easing: 'easeInQuart',
                complete: () => {
                    overlay.classList.add('hidden');
                    overlay.classList.remove('flex');
                }
            });
        } else {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
        }

        if (typeof SoundManager !== 'undefined') SoundManager.play('back');
    }

    function selectLevel(mode, levelNum) {
        close();

        if (typeof SoundManager !== 'undefined') SoundManager.play('click');

        // Set level and navigate
        if (typeof GameState !== 'undefined') {
            GameState.currentLevel[mode] = levelNum;
        }

        setTimeout(() => {
            if (typeof navigateTo === 'function') {
                navigateTo(mode);
            }
        }, 250);
    }

    // ============================================
    // HELPERS
    // ============================================

    function getTotalLevels(mode) {
        if (typeof GameState !== 'undefined') return GameState.progress[mode].total;
        return { robot: 20, network: 17, computer: 15, coding: 15 }[mode] || 10;
    }

    // ============================================
    // PUBLIC API
    // ============================================

    return {
        show,
        close,
        selectLevel
    };
})();
