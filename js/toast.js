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

        const configs = {
            info: { icon: 'ℹ️', bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-200' },
            success: { icon: '✅', bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-200' },
            error: { icon: '❌', bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-200' },
            warning: { icon: '⚠️', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-200' },
            xp: { icon: '✨', bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-200' },
            achievement: { icon: '🏆', bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-200' },
            streak: { icon: '🔥', bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-200' },
            levelup: { icon: '🎉', bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', text: 'text-cyan-200' },
            star: { icon: '⭐', bg: 'bg-yellow-500/20', border: 'border-yellow-400/40', text: 'text-yellow-100' }
        };

        const config = configs[type] || configs.info;
        toast.classList.add(config.bg, config.border, config.text);

        toast.innerHTML = `
            <span class="text-lg flex-shrink-0">${config.icon}</span>
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
    function streak(count) { return createToast(`Streak ${count}x! 🔥`, 'streak', 2500); }
    function levelUp(level, title) { return createToast(`Level Up! Lv.${level} - ${title}`, 'levelup', 4000); }
    function star(count) { return createToast(`${count} Bintang! ${'⭐'.repeat(count)}`, 'star', 3000); }

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
                setTimeout(() => achievement(`${ach.icon} ${ach.name}`), delay + i * 500);
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
