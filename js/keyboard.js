/**
 * INFORMATIKA LAB ADVENTURE
 * Keyboard Shortcuts & Accessibility System
 * Controller-first accessibility following game UI design principles
 */

const KeyboardManager = (() => {
    let isEnabled = true;

    function init() {
        document.addEventListener('keydown', handleKeyDown);
    }

    function handleKeyDown(e) {
        if (!isEnabled) return;

        // Don't intercept when typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }

        switch (e.key) {
            // ESC: Settings or close modals
            case 'Escape':
                e.preventDefault();
                // Close settings if open
                if (typeof SettingsPanel !== 'undefined' && SettingsPanel.isOpen) {
                    SettingsPanel.close();
                    return;
                }
                // Close success modal if visible
                const successModal = document.getElementById('success-modal');
                if (successModal && !successModal.classList.contains('hidden')) {
                    if (typeof hideModal === 'function') hideModal();
                    return;
                }
                // Close MP result modal
                const mpModal = document.getElementById('mp-result-modal');
                if (mpModal && !mpModal.classList.contains('hidden')) {
                    return;
                }
                // Open settings
                if (typeof SettingsPanel !== 'undefined') {
                    SettingsPanel.open();
                }
                break;

            // Backspace: Navigate back
            case 'Backspace':
                e.preventDefault();
                const currentScreen = document.querySelector('.screen.active');
                if (!currentScreen) return;

                const backBtn = currentScreen.querySelector('[data-back]');
                if (backBtn) {
                    backBtn.click();
                    if (typeof SoundManager !== 'undefined') SoundManager.play('back');
                }
                break;

            // Enter: Run / Validate / Confirm
            case 'Enter':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    handleRunAction();
                }
                break;

            // M: Toggle mute
            case 'm':
            case 'M':
                if (typeof SoundManager !== 'undefined') {
                    const wasEnabled = SoundManager.isEnabled();
                    SoundManager.setEnabled(!wasEnabled);
                    if (typeof Toast !== 'undefined') {
                        Toast.info(wasEnabled ? 'Mute Suara dimatikan' : 'Audio Suara dinyalakan', 1500);
                    }
                    if (!wasEnabled) SoundManager.play('click');
                }
                break;

            // R: Reset current level
            case 'r':
            case 'R':
                if (!e.ctrlKey && !e.metaKey) {
                    handleResetAction();
                }
                break;

            // Number keys 1-4: Quick select mode from dashboard
            case '1':
            case '2':
            case '3':
            case '4':
                handleQuickModeSelect(parseInt(e.key));
                break;

            // Arrow keys for level navigation
            case 'ArrowLeft':
                if (e.altKey) {
                    e.preventDefault();
                    handlePrevLevel();
                }
                break;

            case 'ArrowRight':
                if (e.altKey) {
                    e.preventDefault();
                    handleNextLevel();
                }
                break;
        }
    }

    function handleRunAction() {
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) return;

        const id = activeScreen.id;
        if (id === 'robot-screen') {
            const btn = document.getElementById('btn-run-robot');
            if (btn) btn.click();
        } else if (id === 'network-screen') {
            const btn = document.getElementById('btn-validate-network');
            if (btn) btn.click();
        } else if (id === 'computer-screen') {
            const btn = document.getElementById('btn-power-computer');
            if (btn) btn.click();
        } else if (id === 'coding-screen') {
            const btn = document.getElementById('btn-run-code');
            if (btn) btn.click();
        }
    }

    function handleResetAction() {
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) return;

        const id = activeScreen.id;
        if (id === 'robot-screen') {
            const btn = document.getElementById('btn-clear-robot');
            if (btn) btn.click();
        } else if (id === 'network-screen') {
            const btn = document.getElementById('btn-clear-network');
            if (btn) btn.click();
        } else if (id === 'computer-screen') {
            const btn = document.getElementById('btn-clear-computer');
            if (btn) btn.click();
        } else if (id === 'coding-screen') {
            const btn = document.getElementById('btn-reset-code');
            if (btn) btn.click();
        }
    }

    function handleQuickModeSelect(num) {
        const dashboard = document.getElementById('dashboard');
        if (!dashboard || !dashboard.classList.contains('active')) return;

        const modes = ['robot', 'network', 'computer', 'coding'];
        const mode = modes[num - 1];
        if (mode && typeof navigateTo === 'function') {
            navigateTo(mode);
            if (typeof SoundManager !== 'undefined') SoundManager.play('navigate');
        }
    }

    function handlePrevLevel() {
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) return;
        const id = activeScreen.id;
        const modes = { 'robot-screen': 'robot', 'network-screen': 'network', 'computer-screen': 'computer', 'coding-screen': 'coding' };
        if (modes[id] && typeof goToPrevLevel === 'function') {
            goToPrevLevel(modes[id]);
        }
    }

    function handleNextLevel() {
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) return;
        const id = activeScreen.id;
        const modes = { 'robot-screen': 'robot', 'network-screen': 'network', 'computer-screen': 'computer', 'coding-screen': 'coding' };
        if (modes[id] && typeof goToNextLevel === 'function') {
            goToNextLevel(modes[id]);
        }
    }

    function setEnabled(state) {
        isEnabled = state;
    }

    // Auto-init
    document.addEventListener('DOMContentLoaded', init);

    return {
        init,
        setEnabled,
        handleRunAction,
        handleResetAction
    };
})();
