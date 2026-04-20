/**
 * INFORMATIKA LAB ADVENTURE
 * Adaptive Hint System - 10x Learning Feature
 * Tracks player failures per level and shows progressively detailed hints:
 *   Attempt 1: Quick tip
 *   Attempt 2: Detailed step-by-step guide
 *   Attempt 3+: Visual walkthrough / solution
 * Also shows a "Concept Summary" after completing a level.
 */

const AdaptiveHints = (() => {
    // ============================================
    // STATE
    // ============================================

    function getState() {
        const saved = localStorage.getItem('adaptiveHintsState');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { /* ignore */ }
        }
        return { attempts: {}, hintsUsed: {}, conceptsSeen: [] };
    }

    function saveState(s) {
        localStorage.setItem('adaptiveHintsState', JSON.stringify(s));
    }

    function recordAttempt(mode, level) {
        const s = getState();
        const key = `${mode}_${level}`;
        s.attempts[key] = (s.attempts[key] || 0) + 1;
        saveState(s);
        return s.attempts[key];
    }

    function getAttemptCount(mode, level) {
        const s = getState();
        return s.attempts[`${mode}_${level}`] || 0;
    }

    function recordHintUsed(mode, level) {
        const s = getState();
        const key = `${mode}_${level}`;
        s.hintsUsed[key] = (s.hintsUsed[key] || 0) + 1;
        saveState(s);
    }

    function resetAttempts(mode, level) {
        const s = getState();
        delete s.attempts[`${mode}_${level}`];
        saveState(s);
    }

    // ============================================
    // HINT DATA (per mode)
    // ============================================

    const HINT_DATA = {
        robot: {
            concepts: {
                sequence: { title: 'Urutan (Sequence)', desc: 'Komputer menjalankan instruksi satu per satu secara berurutan. Seperti resep masakan, setiap langkah penting!', icon: 'sequence' },
                loop: { title: 'Perulangan (Loop)', desc: 'Loop mengulang sekelompok instruksi. Daripada menulis "maju maju maju", tulis "loop 3x: maju"', icon: 'loop' },
                condition: { title: 'Percabangan (Condition)', desc: 'Program bisa mengambil keputusan berdasarkan kondisi. Jika ada halangan, belok!', icon: 'condition' },
                algorithm: { title: 'Algoritma', desc: 'Algoritma adalah langkah-langkah terurut untuk menyelesaikan masalah. : sederhana, efisien, dan pasti berakhir.', icon: 'algorithm' }
            },
            getLevelHints: function(level) {
                const hints = [];
                if (level <= 3) {
                    hints.push(
                        { level: 1, text: 'Hint Perhatikan arah robot dan tujuan. Susun perintah maju/belok sesuai jalur.', type: 'tip' },
                        { level: 2, text: 'Panduan Langkah demi langkah:\n1. Lihat posisi robot (biru) dan goal (hijau)\n2. Hitung berapa langkah maju yang diperlukan\n3. Tentukan kapan harus belok kiri/kanan\n4. Coba jalankan dan perhatikan hasilnya', type: 'guide' },
                        { level: 3, text: 'Target Solusi:\n• Ikuti jalur terpendek dari robot ke goal\n• Gunakan "Maju" untuk bergerak lurus\n• Gunakan "Belok Kiri/Kanan" saat perlu berubah arah\n• Jumlah minimum perintah tertera di layar', type: 'walkthrough' }
                    );
                } else if (level <= 7) {
                    hints.push(
                        { level: 1, text: 'Hint Level ini lebih panjang. Coba gambar jalur di kertas dulu sebelum menyusun perintah.', type: 'tip' },
                        { level: 2, text: 'Panduan Strategi:\n1. Identifikasi setiap belokan di maze\n2. Hitung langkah lurus antar belokan\n3. Susun: maju → belok → maju → belok → ...\n4. Perhatikan batas perintah!', type: 'guide' },
                        { level: 3, text: 'Target Trik pro:\n• Mulai dari goal, mundur ke robot untuk menemukan jalur optimal\n• Setiap sel membutuhkan 1 perintah "Maju"\n• Belok tidak menggerakkan robot, hanya mengubah arah', type: 'walkthrough' }
                    );
                } else if (level <= 12) {
                    hints.push(
                        { level: 1, text: 'Hint Gunakan LOOP! Jika ada pola berulang (maju-maju-belok), masukkan ke dalam loop.', type: 'tip' },
                        { level: 2, text: 'Panduan Cara menggunakan Loop:\n1. Cari pola yang berulang dalam jalurmu\n2. Klik "Loop" dan atur jumlah pengulangan\n3. Masukkan perintah yang diulang ke dalam loop\n4. 1 loop = banyak perintah di hemat!', type: 'guide' },
                        { level: 3, text: 'Target Teknik Loop:\n• Pola "maju-maju" bisa jadi "Loop 2x: maju"\n• Pola "maju-belok kanan" berulang? Loop!\n• Nested loop (loop dalam loop) untuk pola kompleks\n• Selalu hitung total langkah dari loop', type: 'walkthrough' }
                    );
                } else {
                    hints.push(
                        { level: 1, text: 'Hint Level expert! Kombinasikan loop dan perintah biasa. Cari pola geometris di maze.', type: 'tip' },
                        { level: 2, text: 'Panduan Strategi Expert:\n1. Bagi maze jadi segmen-segmen kecil\n2. Cari pola berulang di setiap segmen\n3. Optimalkan dengan loop\n4. Pastikan total langkah pas - tidak kurang, tidak lebih', type: 'guide' },
                        { level: 3, text: 'Target Master tips:\n• Visualkan jalur sebagai bentuk geometris\n• L-shape = 2 maju + belok + 2 maju\n• Zigzag = Loop: (maju + belok kanan + maju + belok kiri)\n• Spiral = nested loops dengan decrementing count', type: 'walkthrough' }
                    );
                }
                return hints;
            },
            getLevelConcept: function(level) {
                if (level <= 3) return 'sequence';
                if (level <= 7) return 'algorithm';
                if (level <= 15) return 'loop';
                return 'condition';
            }
        },
        network: {
            concepts: {
                topology: { title: 'Topologi Jaringan', desc: 'Topologi adalah bentuk/susunan koneksi antar perangkat. Star, Bus, Ring, dan Mesh masing-masing punya kelebihan.', icon: 'topology' },
                device: { title: 'Perangkat Jaringan', desc: 'Hub menghubungkan banyak perangkat, Switch lebih pintar, Router menghubungkan antar jaringan, Server menyimpan layanan.', icon: 'device' },
                protocol: { title: 'Protokol & IP', desc: 'IP Address mengidentifikasi perangkat di jaringan. Subnet mask menentukan "lingkungan" jaringan.', icon: 'protocol' }
            },
            getLevelHints: function(level) {
                return [
                    { level: 1, text: 'Hint Perhatikan deskripsi topologi yang diminta. Susun perangkat sesuai pola.', type: 'tip' },
                    { level: 2, text: 'Panduan Tips koneksi:\n1. Baca instruksi dengan teliti\n2. Tempatkan perangkat pusat (hub/switch) di tengah\n3. Hubungkan perangkat lain ke perangkat pusat\n4. Periksa kembali semua koneksi', type: 'guide' },
                    { level: 3, text: 'Target Panduan topologi:\n• Star: semua ke 1 pusat\n• Bus: sejajar satu kabel\n• Ring: melingkar tertutup\n• Mesh: setiap perangkat terhubung ke semua', type: 'walkthrough' }
                ];
            },
            getLevelConcept: function(level) {
                if (level <= 5) return 'topology';
                if (level <= 10) return 'device';
                return 'protocol';
            }
        },
        computer: {
            concepts: {
                hardware: { title: 'Komponen Hardware', desc: 'CPU (otak), RAM (ingatan jangka pendek), SSD/HDD (penyimpanan), Motherboard (penghubung semua komponen).', icon: 'hardware' },
                ipo: { title: 'Input-Proses-Output', desc: 'Komputer bekerja: menerima Input (keyboard, mouse), memProsesnya (CPU), lalu mengeluarkan Output (monitor, speaker).', icon: 'ipo' },
                assembly: { title: 'Perakitan PC', desc: 'Urutan merakit: pasang CPU → RAM → ke Motherboard → SSD → Power Supply → casing → kabel. Hati-hati komponen sensitif!', icon: 'assembly' }
            },
            getLevelHints: function(level) {
                return [
                    { level: 1, text: 'Hint Setiap komponen punya tempat spesifik. Perhatikan bentuk dan slot yang cocok.', type: 'tip' },
                    { level: 2, text: 'Panduan Cara merakit:\n1. Identifikasi setiap komponen\n2. Cari slot/tempat yang sesuai bentuknya\n3. Drag komponen ke tempatnya\n4. Komponen yang benar akan "snap" ke posisi', type: 'guide' },
                    { level: 3, text: 'Target Ingat ejaan:\n• CPU → Socket besar persegi di motherboard\n• RAM → Slot panjang tipis\n• GPU → Slot PCIe (terbesar setelah CPU)\n• SSD/HDD → Bay drive\n• PSU → Kotak besar di bawah/atas', type: 'walkthrough' }
                ];
            },
            getLevelConcept: function(level) {
                if (level <= 5) return 'hardware';
                if (level <= 10) return 'ipo';
                return 'assembly';
            }
        },
        coding: {
            concepts: {
                variable: { title: 'Variabel', desc: 'Variabel seperti kotak penyimpan data. Beri nama jelas: umur = 15, nama = "Budi". Tipe: int, string, boolean.', icon: 'variable' },
                looping: { title: 'Perulangan', desc: 'for loop mengulang dengan hitungan, while loop mengulang selama kondisi benar. Hati-hati infinite loop!', icon: 'looping' },
                conditional: { title: 'Percabangan', desc: 'if-else membuat program bisa memilih. if (nilai >= 75): "Lulus" else: "Remedial". Bisa bertingkat (elif).', icon: 'conditional' },
                function: { title: 'Fungsi', desc: 'Fungsi = kumpulan perintah yang diberi nama. Bisa dipanggil berkali-kali. def sapa(nama): print("Halo", nama)', icon: 'function' }
            },
            getLevelHints: function(level) {
                return [
                    { level: 1, text: 'Hint Susun blok kode sesuai urutan logis. Perhatikan indentasi (spasi di kiri)!', type: 'tip' },
                    { level: 2, text: 'Panduan Debugging tips:\n1. Baca error message dengan teliti\n2. Cek urutan baris kode\n3. Pastikan variabel sudah didefinisikan sebelum digunakan\n4. Perhatikan tanda :, (), dan indentasi', type: 'guide' },
                    { level: 3, text: 'Target Pola umum Python:\n• Print: print("Halo")\n• Variabel: x = 10\n• If: if x > 5:\\n    print("besar")\n• For: for i in range(5):\\n    print(i)\n• Fungsi: def nama():\\n    return nilai', type: 'walkthrough' }
                ];
            },
            getLevelConcept: function(level) {
                if (level <= 4) return 'variable';
                if (level <= 8) return 'looping';
                if (level <= 12) return 'conditional';
                return 'function';
            }
        }
    };

    // ============================================
    // HINT DISPLAY
    // ============================================

    function getHintForAttempt(mode, level) {
        const attempts = getAttemptCount(mode, level);
        const modeData = HINT_DATA[mode];
        if (!modeData) return null;

        const hints = modeData.getLevelHints(level);
        if (!hints || hints.length === 0) return null;

        // Progressive: attempt 1 → tip, attempt 2 → guide, attempt 3+ → walkthrough
        let hintLevel = Math.min(attempts, 3);
        if (hintLevel < 1) hintLevel = 1;

        const hint = hints.find(h => h.level === hintLevel) || hints[hints.length - 1];
        return hint;
    }

    function showAdaptiveHint(mode, level) {
        const hint = getHintForAttempt(mode, level);
        if (!hint) return;

        recordHintUsed(mode, level);

        // Find or create adaptive hint container
        const feedbackId = `${mode}-feedback`;
        const feedbackEl = document.getElementById(feedbackId);

        if (feedbackEl) {
            // Type-specific styling
            const typeStyles = {
                tip: { bg: 'rgba(14,165,233,0.15)', border: '#0ea5e9', label: 'Hint Petunjuk', color: '#38bdf8' },
                guide: { bg: 'rgba(34,197,94,0.15)', border: '#22c55e', label: 'Panduan Panduan', color: '#4ade80' },
                walkthrough: { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', label: 'Target Solusi', color: '#fbbf24' }
            };
            const style = typeStyles[hint.type] || typeStyles.tip;
            const attempts = getAttemptCount(mode, level);

            feedbackEl.className = 'mt-4 p-4 rounded-2xl';
            feedbackEl.style.cssText = `background: ${style.bg}; border: 2px solid ${style.border}; opacity: 1;`;
            feedbackEl.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-bold" style="color: ${style.color}">${style.label}</span>
                    <span class="text-xs text-dark-300">Percobaan ke-${attempts}</span>
                </div>
                <p class="text-sm text-dark-100 whitespace-pre-line leading-relaxed">${hint.text}</p>
                ${hint.type === 'walkthrough' ? `
                    <div class="mt-2 px-3 py-1.5 rounded-lg bg-dark-800/50 text-xs text-dark-300 flex items-center gap-2">
                        <span>Peringatan</span>
                        <span>Menggunakan solusi akan mengurangi bintang yang didapat</span>
                    </div>
                ` : ''}
            `;

            // Animate
            if (typeof anime !== 'undefined') {
                anime({ targets: feedbackEl, translateY: [10, 0], opacity: [0, 1], duration: 300, easing: 'easeOutQuart' });
            }
        }

        if (typeof SoundManager !== 'undefined') {
            SoundManager.play(hint.type === 'walkthrough' ? 'hint' : 'click');
        }
    }

    // ============================================
    // CONCEPT SUMMARY (shown after level complete)
    // ============================================

    function showConceptSummary(mode, level) {
        const modeData = HINT_DATA[mode];
        if (!modeData) return;

        const conceptKey = modeData.getLevelConcept(level);
        const concept = modeData.concepts[conceptKey];
        if (!concept) return;

        // Don't show same concept too frequently
        const s = getState();
        const conceptId = `${mode}_${conceptKey}`;
        if (s.conceptsSeen.includes(conceptId) && Math.random() > 0.3) return; // 70% skip if already seen

        // Mark as seen
        if (!s.conceptsSeen.includes(conceptId)) {
            s.conceptsSeen.push(conceptId);
            saveState(s);
        }

        // Show concept card after a delay (to not interrupt celebration)
        setTimeout(() => {
            const overlay = document.getElementById('concept-summary-overlay');
            if (!overlay) return;

            overlay.innerHTML = `
                <div class="glass-card rounded-3xl p-6 max-w-md w-full border border-dark-600" style="box-shadow: 0 0 60px rgba(139,92,246,0.2);">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-2xl">${conceptIconSvg(concept.icon)}</div>
                        <div>
                            <p class="text-xs text-purple-300 font-bold uppercase tracking-wider">Kamu Baru Belajar</p>
                            <h3 class="font-display text-lg font-bold text-white">${concept.title}</h3>
                        </div>
                    </div>
                    <p class="text-sm text-dark-200 leading-relaxed mb-4">${concept.desc}</p>
                    <button class="w-full py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-sm transition-colors" onclick="AdaptiveHints.closeConceptSummary()">
                        Mengerti! Siap
                    </button>
                </div>
            `;

            overlay.classList.remove('hidden');
            overlay.classList.add('flex');

            if (typeof anime !== 'undefined') {
                anime({ targets: overlay, opacity: [0, 1], duration: 200, easing: 'easeOutQuart' });
                anime({ targets: overlay.querySelector('.glass-card'), scale: [0.9, 1], opacity: [0, 1], duration: 300, delay: 50, easing: 'easeOutBack' });
            }

            if (typeof SoundManager !== 'undefined') SoundManager.play('achievement');
        }, 3500); // Show 3.5s after level complete (after star reveals)
    }

    function closeConceptSummary() {
        const overlay = document.getElementById('concept-summary-overlay');
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

        if (typeof SoundManager !== 'undefined') SoundManager.play('click');
    }

    // ============================================
    // SMART HINT BUTTON STATE
    // ============================================

    function getHintButtonState(mode, level) {
        const attempts = getAttemptCount(mode, level);
        if (attempts >= 3) return { text: 'Target Lihat Solusi', type: 'walkthrough', pulse: true };
        if (attempts >= 2) return { text: 'Panduan Panduan Detail', type: 'guide', pulse: true };
        if (attempts >= 1) return { text: 'Hint Petunjuk', type: 'tip', pulse: false };
        return { text: 'Hint', type: 'tip', pulse: false };
    }

    function conceptIconSvg(iconKey) {
        const map = {
            sequence: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h10M4 17h7"/></svg>',
            loop: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6"/></svg>',
            condition: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h12L6 20h12"/></svg>',
            algorithm: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 7 3-3 3 3M8 4v16m8-16h3v3h-3zM16 11h3v3h-3zM16 18h3v3h-3z"/></svg>',
            topology: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M12 7v5m0 0-7 4m7-4 7 4"/></svg>',
            device: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="6" rx="2"/><rect x="7" y="13" width="10" height="6" rx="2"/></svg>',
            protocol: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/><path d="M8 4v16m8-16v16"/></svg>',
            hardware: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
            ipo: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h5m6 0h5M11 8l4 4-4 4"/></svg>',
            assembly: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 7 7 14m0 0 2.5 2.5M7 14 4.5 11.5M20 7l-3 3"/></svg>',
            variable: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M8 10h8M8 14h5"/></svg>',
            looping: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6"/></svg>',
            conditional: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h12L6 20h12"/></svg>',
            function: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 7h8M10 4v16M14 4v16"/></svg>'
        };
        return map[iconKey] || map.sequence;
    }

    // ============================================
    // PUBLIC API
    // ============================================

    return {
        recordAttempt,
        getAttemptCount,
        getHintForAttempt,
        showAdaptiveHint,
        showConceptSummary,
        closeConceptSummary,
        getHintButtonState,
        resetAttempts,
        HINT_DATA
    };
})();
