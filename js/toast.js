/**
 * INFORMATIKA LAB ADVENTURE
 * Toast Notification System - Non-intrusive feedback
 * Follows game UI design principles: communication without interruption
 */

const Toast = (() => {
    let container = null;
    const queue = [];
    const MAX_VISIBLE = 3;

    function ensureContainer() {
        if (container) return;
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
        container.style.maxWidth = '380px';
        document.body.appendChild(container);
    }

    function createToast(message, type = 'info', duration = 3000) {
        ensureContainer();

        const toast = document.createElement('div');
        toast.className = `toast-item pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm backdrop-blur-lg border shadow-2xl transition-all duration-300 transform translate-x-full opacity-0`;

        const getIconSvg = (iconType) => {
            const icons = {
                info: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h2v4h-2z"/></svg>',
                success: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>',
                error: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></svg>',
                warning: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5m0 3h.01"/></svg>',
                xp: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M3 12h18"/></svg>',
                achievement: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3h8v4a4 4 0 0 1-8 0V3Z"/><path d="M6 7H4a3 3 0 0 0 3 3m8-3h2a3 3 0 0 1-3 3"/><path d="M12 11v4m-3 6h6"/></svg>',
                streak: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3c2 3 .8 5.5-1 7 3.2-.7 6 1.6 6 5 0 3.3-2.7 6-6 6s-6-2.7-6-6c0-3.1 2-5 4-6.5C8.3 6 9.4 4 12 3Z"/></svg>',
                levelup: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 4 3 6 6 .9-4.5 4.4 1 6.2L12 18.7l-5.5 2.8 1-6.2L3 10.9l6-.9L12 4Z"/></svg>',
                star: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
            };
            return icons[iconType] || icons.info;
        };

        const configs = {
            info: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-200' },
            success: { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-200' },
            error: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-200' },
            warning: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-200' },
            xp: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-200' },
            achievement: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-200' },
            streak: { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-200' },
            levelup: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', text: 'text-cyan-200' },
            star: { bg: 'bg-yellow-500/20', border: 'border-yellow-400/40', text: 'text-yellow-100' }
        };

        const config = configs[type] || configs.info;
        toast.classList.add(config.bg, config.border, config.text);

        toast.innerHTML = `
            <span class="text-lg flex-shrink-0" aria-hidden="true">${getIconSvg(type)}</span>
            <span class="flex-1 leading-snug">${message}</span>
        `;

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
            toast.classList.add('translate-x-0', 'opacity-100');
        });

        // Sound
        if (typeof SoundManager !== 'undefined') {
            if (type === 'success' || type === 'achievement') SoundManager.play('success');
            else if (type === 'error') SoundManager.play('error');
            else if (type === 'xp') SoundManager.play('xpGain');
            else if (type === 'levelup') SoundManager.play('levelUp');
            else if (type === 'star') SoundManager.play('starEarned');
            else SoundManager.play('click');
        }

        // Auto remove
        const removeTimer = setTimeout(() => removeToast(toast), duration);

        // Click to dismiss
        toast.addEventListener('click', () => {
            clearTimeout(removeTimer);
            removeToast(toast);
        });

        return toast;
    }

    function removeToast(toast) {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }

    // ============================================
    // CONVENIENCE METHODS
    // ============================================

    function info(msg, duration) { return createToast(msg, 'info', duration); }
    function success(msg, duration) { return createToast(msg, 'success', duration); }
    function error(msg, duration) { return createToast(msg, 'error', duration); }
    function warning(msg, duration) { return createToast(msg, 'warning', duration); }
    function xp(amount) { return createToast(`+${amount} XP`, 'xp', 2500); }
    function achievement(name) { return createToast(`Achievement: ${name}`, 'achievement', 4000); }
    function streak(count) { return createToast(`Streak ${count}x!`, 'streak', 2500); }
    function levelUp(level, title) { return createToast(`Level Up! Lv.${level} - ${title}`, 'levelup', 4000); }
    function star(count) { return createToast(`${count} Bintang!`, 'star', 3000); }

    // ============================================
    // LEVEL COMPLETE CELEBRATION
    // ============================================

    function showLevelResult(result) {
        // Delay chain for dramatic effect
        let delay = 0;

        if (result.stars > 0) {
            setTimeout(() => star(result.stars), delay);
            delay += 400;
        }

        if (result.xpGained > 0) {
            setTimeout(() => xp(result.xpGained), delay);
            delay += 400;
        }

        if (result.streak > 1) {
            setTimeout(() => streak(result.streak), delay);
            delay += 400;
        }

        if (result.leveledUp) {
            setTimeout(() => levelUp(result.newLevel, result.levelTitle), delay);
            delay += 400;
        }

        if (result.newAchievements && result.newAchievements.length > 0) {
            result.newAchievements.forEach((ach, i) => {
                setTimeout(() => achievement(ach.name), delay + i * 500);
            });
        }
    }

    return {
        show: createToast,
        info,
        success,
        error,
        warning,
        xp,
        achievement,
        streak,
        levelUp,
        star,
        showLevelResult
    };
})();
