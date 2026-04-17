/**
 * INFORMATIKA LAB ADVENTURE
 * Sound Manager - Web Audio API synthesized sound effects
 * No external audio files needed - all sounds generated procedurally
 */

const SoundManager = (() => {
    let audioCtx = null;
    let enabled = true;
    let volume = 0.5;
    let initialized = false;

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        if (initialized) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
            enabled = false;
        }
    }

    function ensureContext() {
        if (!audioCtx) init();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // ============================================
    // CORE SYNTH HELPERS
    // ============================================

    function playTone(freq, duration, type = 'sine', vol = 0.3, delay = 0) {
        if (!enabled || !audioCtx) return;
        ensureContext();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

        gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(vol * volume, audioCtx.currentTime + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
    }

    function playNoise(duration, vol = 0.1, filterFreq = 3000) {
        if (!enabled || !audioCtx) return;
        ensureContext();

        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq;

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(vol * volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        noise.start();
        noise.stop(audioCtx.currentTime + duration);
    }

    // ============================================
    // SOUND EFFECTS LIBRARY
    // ============================================

    const sounds = {
        // UI Clicks
        click() {
            playTone(800, 0.08, 'sine', 0.15);
        },

        hover() {
            playTone(1200, 0.04, 'sine', 0.06);
        },

        // Navigation
        navigate() {
            playTone(523, 0.1, 'sine', 0.2);
            playTone(659, 0.1, 'sine', 0.2, 0.05);
        },

        back() {
            playTone(659, 0.1, 'sine', 0.15);
            playTone(523, 0.1, 'sine', 0.15, 0.05);
        },

        // Game Actions
        drop() {
            playTone(400, 0.12, 'triangle', 0.2);
            playNoise(0.05, 0.05, 2000);
        },

        pickup() {
            playTone(600, 0.1, 'triangle', 0.15);
            playTone(800, 0.08, 'triangle', 0.12, 0.06);
        },

        robotStep() {
            playTone(200, 0.08, 'square', 0.08);
            playNoise(0.04, 0.03, 1000);
        },

        robotTurn() {
            playTone(300, 0.12, 'sawtooth', 0.06);
        },

        connect() {
            playTone(440, 0.1, 'sine', 0.15);
            playTone(554, 0.1, 'sine', 0.15, 0.08);
            playTone(659, 0.12, 'sine', 0.15, 0.16);
        },

        disconnect() {
            playTone(659, 0.1, 'sine', 0.12);
            playTone(440, 0.15, 'sine', 0.12, 0.08);
        },

        place() {
            playTone(500, 0.1, 'triangle', 0.2);
            playNoise(0.06, 0.04, 1500);
        },

        // Feedback
        success() {
            playTone(523, 0.15, 'sine', 0.25);
            playTone(659, 0.15, 'sine', 0.25, 0.1);
            playTone(784, 0.15, 'sine', 0.25, 0.2);
            playTone(1047, 0.3, 'sine', 0.3, 0.3);
        },

        error() {
            playTone(300, 0.15, 'sawtooth', 0.15);
            playTone(250, 0.2, 'sawtooth', 0.15, 0.12);
        },

        warning() {
            playTone(440, 0.12, 'triangle', 0.15);
            playTone(440, 0.12, 'triangle', 0.15, 0.2);
        },

        // Achievements & Rewards
        levelComplete() {
            const notes = [523, 659, 784, 1047, 784, 1047, 1318];
            notes.forEach((freq, i) => {
                playTone(freq, 0.18, 'sine', 0.2, i * 0.08);
            });
        },

        starEarned() {
            playTone(880, 0.1, 'sine', 0.2);
            playTone(1108, 0.1, 'sine', 0.2, 0.08);
            playTone(1318, 0.2, 'sine', 0.25, 0.16);
        },

        achievement() {
            const notes = [659, 784, 1047, 1318, 1568];
            notes.forEach((freq, i) => {
                playTone(freq, 0.2, 'sine', 0.2 + i * 0.02, i * 0.1);
            });
            playNoise(0.1, 0.03, 5000);
        },

        xpGain() {
            playTone(700, 0.06, 'sine', 0.12);
            playTone(900, 0.06, 'sine', 0.12, 0.04);
        },

        levelUp() {
            const notes = [523, 659, 784, 1047, 1318, 1568];
            notes.forEach((freq, i) => {
                playTone(freq, 0.25, 'sine', 0.25, i * 0.12);
                playTone(freq * 1.5, 0.2, 'triangle', 0.1, i * 0.12 + 0.05);
            });
        },

        // Character Select
        characterSelect() {
            playTone(523, 0.1, 'sine', 0.2);
            playTone(784, 0.15, 'sine', 0.2, 0.08);
        },

        gameStart() {
            playTone(392, 0.12, 'sine', 0.2);
            playTone(523, 0.12, 'sine', 0.2, 0.1);
            playTone(659, 0.12, 'sine', 0.2, 0.2);
            playTone(784, 0.25, 'sine', 0.25, 0.3);
        },

        // Timer/Countdown
        tick() {
            playTone(1000, 0.03, 'sine', 0.08);
        },

        countdownBeep() {
            playTone(800, 0.15, 'sine', 0.2);
        },

        countdownGo() {
            playTone(800, 0.1, 'sine', 0.25);
            playTone(1200, 0.3, 'sine', 0.3, 0.1);
        },

        // Power on (computer mode)
        powerOn() {
            playTone(150, 0.4, 'sine', 0.15);
            playTone(200, 0.3, 'sine', 0.12, 0.2);
            playTone(400, 0.3, 'sine', 0.15, 0.4);
            playNoise(0.2, 0.04, 800);
        },

        powerOff() {
            playTone(400, 0.3, 'sine', 0.12);
            playTone(200, 0.3, 'sine', 0.1, 0.15);
            playTone(100, 0.4, 'sine', 0.08, 0.3);
        },

        // Multiplayer
        opponentJoin() {
            playTone(523, 0.1, 'sine', 0.2);
            playTone(659, 0.12, 'sine', 0.2, 0.08);
            playTone(784, 0.15, 'sine', 0.2, 0.16);
        },

        win() {
            const notes = [523, 659, 784, 1047, 1318, 1568, 2093];
            notes.forEach((freq, i) => {
                playTone(freq, 0.3, 'sine', 0.2, i * 0.1);
                playTone(freq * 0.5, 0.25, 'triangle', 0.08, i * 0.1);
            });
        },

        lose() {
            playTone(400, 0.2, 'sawtooth', 0.1);
            playTone(350, 0.2, 'sawtooth', 0.1, 0.15);
            playTone(300, 0.3, 'sawtooth', 0.1, 0.3);
            playTone(250, 0.4, 'sawtooth', 0.08, 0.45);
        }
    };

    // ============================================
    // PUBLIC API
    // ============================================

    function play(soundName) {
        if (!enabled) return;
        ensureContext();
        if (sounds[soundName]) {
            sounds[soundName]();
        }
    }

    function setEnabled(state) {
        enabled = state;
        localStorage.setItem('soundEnabled', state);
    }

    function isEnabled() {
        return enabled;
    }

    function setVolume(val) {
        volume = Math.max(0, Math.min(1, val));
        localStorage.setItem('soundVolume', volume);
    }

    function getVolume() {
        return volume;
    }

    function loadSettings() {
        const savedEnabled = localStorage.getItem('soundEnabled');
        const savedVolume = localStorage.getItem('soundVolume');
        if (savedEnabled !== null) enabled = savedEnabled === 'true';
        if (savedVolume !== null) volume = parseFloat(savedVolume);
    }

    // Auto-load settings
    loadSettings();

    return {
        init,
        play,
        setEnabled,
        isEnabled,
        setVolume,
        getVolume,
        loadSettings
    };
})();

// Initialize on first user interaction
document.addEventListener('click', () => SoundManager.init(), { once: true });
document.addEventListener('touchstart', () => SoundManager.init(), { once: true });
