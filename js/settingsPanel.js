/**
 * INFORMATIKA LAB ADVENTURE
 * Settings Panel - Sound, Accessibility, Display Options
 * Follows game UI principles: non-intrusive, accessible, controller-friendly
 */

const SettingsPanel = (() => {
    let isOpen = false;
    let panelEl = null;

    // ============================================
    // CREATE PANEL
    // ============================================

    function createPanel() {
        if (panelEl) return;

        panelEl = document.createElement('div');
        panelEl.id = 'settings-panel';
        panelEl.className = 'fixed inset-0 z-[9998] hidden';
        panelEl.innerHTML = `
            <!-- Overlay -->
            <div class="settings-overlay absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 opacity-0" id="settings-overlay"></div>

            <!-- Slide-in Panel -->
            <div class="settings-drawer absolute right-0 top-0 bottom-0 w-full max-w-md bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-l border-white/10 shadow-2xl transform translate-x-full transition-transform duration-300 overflow-y-auto" id="settings-drawer">
                <!-- Header -->
                <div class="sticky top-0 z-10 bg-[#1e293b]/90 backdrop-blur-sm border-b border-white/10 p-5 flex items-center justify-between">
                    <h2 class="font-display text-2xl font-bold text-white flex items-center gap-2">⚙️ Pengaturan</h2>
                    <button onclick="SettingsPanel.close()" class="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl transition-colors" aria-label="Tutup pengaturan">✕</button>
                </div>

                <div class="p-5 space-y-6">
                    <!-- Sound Section -->
                    <section class="settings-section">
                        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">🔊 Suara</h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between bg-white/5 rounded-xl p-4">
                                <div>
                                    <p class="font-semibold text-white">Efek Suara</p>
                                    <p class="text-xs text-slate-400">Suara klik, navigasi, dan feedback</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="toggle-sound" class="sr-only peer" checked>
                                    <div class="w-12 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>

                            <div class="bg-white/5 rounded-xl p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <p class="font-semibold text-white">Volume</p>
                                    <span class="text-sm text-slate-400 font-mono" id="volume-value">50%</span>
                                </div>
                                <input type="range" id="volume-slider" min="0" max="100" value="50" class="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500">
                            </div>
                        </div>
                    </section>

                    <!-- Accessibility Section -->
                    <section class="settings-section">
                        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">♿ Aksesibilitas</h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between bg-white/5 rounded-xl p-4">
                                <div>
                                    <p class="font-semibold text-white">Kurangi Animasi</p>
                                    <p class="text-xs text-slate-400">Matikan efek gerakan berlebih</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="toggle-reduced-motion" class="sr-only peer">
                                    <div class="w-12 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-between bg-white/5 rounded-xl p-4">
                                <div>
                                    <p class="font-semibold text-white">Mode Kontras Tinggi</p>
                                    <p class="text-xs text-slate-400">Warna lebih terang untuk visibilitas</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="toggle-high-contrast" class="sr-only peer">
                                    <div class="w-12 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>

                            <div class="bg-white/5 rounded-xl p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <p class="font-semibold text-white">Ukuran Teks</p>
                                    <span class="text-sm text-slate-400" id="font-size-value">Normal</span>
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="SettingsPanel.setFontSize('small')" class="flex-1 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors" data-size="small">A<sup>-</sup></button>
                                    <button onclick="SettingsPanel.setFontSize('normal')" class="flex-1 py-2 rounded-lg text-sm font-medium bg-emerald-500/30 border border-emerald-500/50 transition-colors" data-size="normal">A</button>
                                    <button onclick="SettingsPanel.setFontSize('large')" class="flex-1 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors" data-size="large">A<sup>+</sup></button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Display Section -->
                    <section class="settings-section">
                        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">🎨 Tampilan</h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between bg-white/5 rounded-xl p-4">
                                <div>
                                    <p class="font-semibold text-white">Efek Partikel</p>
                                    <p class="text-xs text-slate-400">Efek confetti dan partikel</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="toggle-particles" class="sr-only peer" checked>
                                    <div class="w-12 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-between bg-white/5 rounded-xl p-4">
                                <div>
                                    <p class="font-semibold text-white">Background Animasi</p>
                                    <p class="text-xs text-slate-400">Floating elements & blobs</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="toggle-bg-anim" class="sr-only peer" checked>
                                    <div class="w-12 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    <!-- Data Section -->
                    <section class="settings-section">
                        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">💾 Data</h3>
                        <div class="space-y-3">
                            <button onclick="SettingsPanel.resetProgress()" class="w-full py-3 rounded-xl text-sm font-bold bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors">
                                🗑️ Reset Semua Progress
                            </button>
                        </div>
                    </section>

                    <!-- Keyboard Shortcuts -->
                    <section class="settings-section">
                        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">⌨️ Pintasan Keyboard</h3>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between bg-white/5 rounded-lg p-3">
                                <span class="text-slate-300">Buka Pengaturan</span>
                                <kbd class="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono text-xs">Esc</kbd>
                            </div>
                            <div class="flex justify-between bg-white/5 rounded-lg p-3">
                                <span class="text-slate-300">Kembali ke Menu</span>
                                <kbd class="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono text-xs">Backspace</kbd>
                            </div>
                            <div class="flex justify-between bg-white/5 rounded-lg p-3">
                                <span class="text-slate-300">Jalankan / Validasi</span>
                                <kbd class="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono text-xs">Enter</kbd>
                            </div>
                            <div class="flex justify-between bg-white/5 rounded-lg p-3">
                                <span class="text-slate-300">Reset Level</span>
                                <kbd class="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono text-xs">R</kbd>
                            </div>
                            <div class="flex justify-between bg-white/5 rounded-lg p-3">
                                <span class="text-slate-300">Toggle Suara</span>
                                <kbd class="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono text-xs">M</kbd>
                            </div>
                        </div>
                    </section>

                    <!-- Version Info -->
                    <div class="text-center pt-4 pb-8 border-t border-white/5">
                        <p class="text-xs text-slate-500">Informatika Lab Adventure v2.0</p>
                        <p class="text-xs text-slate-600 mt-1">Made with ❤️ for Indonesian Students</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panelEl);
        bindEvents();
    }

    // ============================================
    // EVENT BINDINGS
    // ============================================

    function bindEvents() {
        // Sound toggle
        const soundToggle = document.getElementById('toggle-sound');
        if (soundToggle) {
            soundToggle.checked = typeof SoundManager !== 'undefined' ? SoundManager.isEnabled() : true;
            soundToggle.addEventListener('change', (e) => {
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.setEnabled(e.target.checked);
                    if (e.target.checked) SoundManager.play('click');
                }
            });
        }

        // Volume slider
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue = document.getElementById('volume-value');
        if (volumeSlider) {
            const currentVol = typeof SoundManager !== 'undefined' ? SoundManager.getVolume() * 100 : 50;
            volumeSlider.value = currentVol;
            if (volumeValue) volumeValue.textContent = `${Math.round(currentVol)}%`;

            volumeSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                if (volumeValue) volumeValue.textContent = `${val}%`;
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.setVolume(val / 100);
                }
            });
        }

        // Reduced motion
        const reducedMotion = document.getElementById('toggle-reduced-motion');
        if (reducedMotion) {
            reducedMotion.checked = localStorage.getItem('reducedMotion') === 'true';
            reducedMotion.addEventListener('change', (e) => {
                localStorage.setItem('reducedMotion', e.target.checked);
                document.documentElement.classList.toggle('reduced-motion', e.target.checked);
            });
        }

        // High contrast
        const highContrast = document.getElementById('toggle-high-contrast');
        if (highContrast) {
            highContrast.checked = localStorage.getItem('highContrast') === 'true';
            highContrast.addEventListener('change', (e) => {
                localStorage.setItem('highContrast', e.target.checked);
                document.documentElement.classList.toggle('high-contrast', e.target.checked);
            });
        }

        // Particles
        const particles = document.getElementById('toggle-particles');
        if (particles) {
            particles.checked = localStorage.getItem('particles') !== 'false';
            particles.addEventListener('change', (e) => {
                localStorage.setItem('particles', e.target.checked);
            });
        }

        // Background animation
        const bgAnim = document.getElementById('toggle-bg-anim');
        if (bgAnim) {
            bgAnim.checked = localStorage.getItem('bgAnim') !== 'false';
            bgAnim.addEventListener('change', (e) => {
                localStorage.setItem('bgAnim', e.target.checked);
                const blobBg = document.getElementById('blob-bg');
                const spaceBg = document.getElementById('space-bg');
                if (blobBg) blobBg.style.display = e.target.checked ? '' : 'none';
                if (spaceBg) spaceBg.style.display = e.target.checked ? '' : 'none';
            });
        }

        // Overlay click to close
        const overlay = document.getElementById('settings-overlay');
        if (overlay) overlay.addEventListener('click', close);
    }

    // ============================================
    // OPEN / CLOSE
    // ============================================

    function open() {
        createPanel();
        panelEl.classList.remove('hidden');

        requestAnimationFrame(() => {
            document.getElementById('settings-overlay').classList.remove('opacity-0');
            document.getElementById('settings-overlay').classList.add('opacity-100');
            document.getElementById('settings-drawer').classList.remove('translate-x-full');
        });

        isOpen = true;
        if (typeof SoundManager !== 'undefined') SoundManager.play('navigate');
    }

    function close() {
        if (!panelEl) return;

        document.getElementById('settings-overlay').classList.remove('opacity-100');
        document.getElementById('settings-overlay').classList.add('opacity-0');
        document.getElementById('settings-drawer').classList.add('translate-x-full');

        setTimeout(() => {
            panelEl.classList.add('hidden');
        }, 300);

        isOpen = false;
        if (typeof SoundManager !== 'undefined') SoundManager.play('back');
    }

    function toggle() {
        isOpen ? close() : open();
    }

    // ============================================
    // FONT SIZE
    // ============================================

    function setFontSize(size) {
        const sizes = { small: '14px', normal: '16px', large: '18px' };
        document.documentElement.style.fontSize = sizes[size] || '16px';
        localStorage.setItem('fontSize', size);

        // Update UI
        const label = document.getElementById('font-size-value');
        if (label) label.textContent = size === 'small' ? 'Kecil' : size === 'large' ? 'Besar' : 'Normal';

        // Update button styles
        document.querySelectorAll('[data-size]').forEach(btn => {
            btn.className = btn.dataset.size === size
                ? 'flex-1 py-2 rounded-lg text-sm font-medium bg-emerald-500/30 border border-emerald-500/50 transition-colors'
                : 'flex-1 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors';
        });
    }

    // ============================================
    // RESET
    // ============================================

    function resetProgress() {
        if (confirm('⚠️ Yakin ingin menghapus SEMUA progress? Ini tidak bisa dikembalikan!')) {
            localStorage.clear();
            location.reload();
        }
    }

    // ============================================
    // INIT SAVED SETTINGS
    // ============================================

    function initSavedSettings() {
        // Font size
        const savedFontSize = localStorage.getItem('fontSize');
        if (savedFontSize) {
            const sizes = { small: '14px', normal: '16px', large: '18px' };
            document.documentElement.style.fontSize = sizes[savedFontSize] || '16px';
        }

        // Reduced motion
        if (localStorage.getItem('reducedMotion') === 'true') {
            document.documentElement.classList.add('reduced-motion');
        }

        // High contrast
        if (localStorage.getItem('highContrast') === 'true') {
            document.documentElement.classList.add('high-contrast');
        }

        // Background animation
        if (localStorage.getItem('bgAnim') === 'false') {
            const blobBg = document.getElementById('blob-bg');
            const spaceBg = document.getElementById('space-bg');
            if (blobBg) blobBg.style.display = 'none';
            if (spaceBg) spaceBg.style.display = 'none';
        }
    }

    // Init on load
    document.addEventListener('DOMContentLoaded', initSavedSettings);

    return {
        open,
        close,
        toggle,
        setFontSize,
        resetProgress,
        get isOpen() { return isOpen; }
    };
})();
