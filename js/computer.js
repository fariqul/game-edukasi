/**
 * INFORMATIKA LAB ADVENTURE
 * Mode 3: Build a Computer
 * Konsep: Sistem Komputer, Fungsi Hardware, Input-Process-Output
 * 15 Levels with Progressive Difficulty
 */

const ComputerGame = (() => {
    // ============================================
    // LEVEL DATA - 15 LEVELS
    // ============================================

    const levels = [
        // ===== BEGINNER: Basic Components =====
        {
            id: 1,
            mission: "Level 1: Otak Komputer! Algoritma",
            hint: "CPU adalah otak komputer. Pasang di slot yang tepat!",
            concept: "CPU - Central Processing Unit",
            required: ['cpu'],
            description: {
                cpu: "CPU (Central Processing Unit) adalah otak komputer yang memproses semua instruksi."
            }
        },
        {
            id: 2,
            mission: "Level 2: CPU + RAM = Power! Simulasi",
            hint: "RAM membantu CPU bekerja lebih cepat dengan menyimpan data sementara.",
            concept: "Memory - RAM",
            required: ['cpu', 'ram'],
            description: {
                cpu: "CPU memproses instruksi program.",
                ram: "RAM (Random Access Memory) menyimpan data sementara saat komputer berjalan."
            }
        },
        {
            id: 3,
            mission: "Level 3: Simpan Data! Storage",
            hint: "Storage menyimpan semua file secara permanen.",
            concept: "Storage - HDD/SSD",
            required: ['cpu', 'ram', 'storage'],
            description: {
                cpu: "CPU memproses data dari storage.",
                ram: "RAM menyimpan data yang sedang digunakan.",
                storage: "Storage (HDD/SSD) menyimpan data secara permanen."
            }
        },

        // ===== EASY: Power System =====
        {
            id: 4,
            mission: "Level 4: Tenaga Listrik! Koneksi",
            hint: "Semua komponen butuh listrik dari PSU.",
            concept: "PSU - Power Supply",
            required: ['cpu', 'ram', 'storage', 'psu'],
            description: {
                cpu: "CPU memproses instruksi program.",
                ram: "RAM menyimpan data yang sedang digunakan.",
                storage: "Storage menyimpan file secara permanen.",
                psu: "PSU (Power Supply Unit) menyediakan daya listrik ke semua komponen."
            }
        },
        {
            id: 5,
            mission: "Level 5: Motherboard Lengkap!",
            hint: "Tambahkan Motherboard sebagai papan utama penghubung.",
            concept: "Motherboard - Main Board",
            required: ['motherboard', 'cpu', 'ram', 'storage', 'psu'],
            description: {
                motherboard: "Motherboard adalah papan sirkuit utama yang menghubungkan semua komponen.",
                cpu: "CPU dipasang di socket motherboard.",
                ram: "RAM dipasang di slot DIMM motherboard.",
                storage: "Storage terhubung via SATA ke motherboard.",
                psu: "PSU menyediakan daya ke motherboard."
            }
        },

        // ===== MEDIUM: Graphics & Cooling =====
        {
            id: 6,
            mission: "Level 6: Komputer Gaming! Game",
            hint: "GPU merender grafis game. Pasang CPU, RAM, Storage, PSU seperti biasa, lalu tambahkan GPU di slot yang tepat!",
            concept: "GPU - Graphics Card",
            required: ['cpu', 'ram', 'storage', 'psu', 'gpu'],
            description: {
                cpu: "CPU menangani proses umum komputer.",
                ram: "RAM menyimpan data game yang sedang dimainkan.",
                storage: "Storage menyimpan file game.",
                psu: "PSU memberikan daya ke semua komponen.",
                gpu: "GPU (Graphics Processing Unit) memproses grafis game."
            }
        },
        {
            id: 7,
            mission: "Level 7: Jaga Suhu! Pendingin",
            hint: "Cooler menjaga suhu CPU tetap dingin agar tidak overheat.",
            concept: "Cooling System",
            required: ['cpu', 'ram', 'storage', 'psu', 'gpu', 'cooler'],
            description: {
                cpu: "CPU menghasilkan panas saat bekerja.",
                ram: "RAM DDR4/DDR5 untuk performa tinggi.",
                storage: "NVMe SSD untuk kecepatan maksimal.",
                psu: "PSU 600W+ untuk komputer gaming.",
                gpu: "GPU high-end untuk gaming.",
                cooler: "CPU Cooler mendinginkan prosesor agar tidak overheat."
            }
        },

        // ===== INTERMEDIATE: Peripherals =====
        {
            id: 8,
            mission: "Level 8: Input & Output! Input Output",
            hint: "Keyboard dan Mouse adalah perangkat input utama.",
            concept: "I/O Devices",
            required: ['cpu', 'ram', 'storage', 'psu', 'keyboard', 'mouse'],
            description: {
                cpu: "CPU memproses input dari keyboard dan mouse.",
                ram: "RAM menyimpan data input sementara.",
                storage: "Storage menyimpan program yang menerima input.",
                psu: "PSU memberikan daya ke semua komponen.",
                keyboard: "Keyboard adalah perangkat INPUT untuk mengetik.",
                mouse: "Mouse adalah perangkat INPUT untuk navigasi."
            }
        },
        {
            id: 9,
            mission: "Level 9: Tampilan Visual!",
            hint: "Monitor menampilkan output dari komputer.",
            concept: "Display Output",
            required: ['cpu', 'ram', 'storage', 'psu', 'gpu', 'monitor'],
            description: {
                cpu: "CPU memproses data untuk ditampilkan.",
                ram: "RAM frame buffer untuk display.",
                storage: "Storage menyimpan file media.",
                psu: "PSU memberikan daya stabil.",
                gpu: "GPU memproses grafis untuk monitor.",
                monitor: "Monitor adalah perangkat OUTPUT untuk menampilkan visual."
            }
        },

        // ===== ADVANCED: Complete System =====
        {
            id: 10,
            mission: "Level 10: Master Builder!",
            hint: "Build lengkap! Urutan ideal: Motherboard → CPU → Cooler → RAM → Storage → PSU → GPU → Case. Semua harus di slot yang tepat!",
            concept: "Complete PC Build",
            required: ['motherboard', 'cpu', 'cooler', 'ram', 'storage', 'psu', 'gpu', 'case'],
            description: {
                motherboard: "Motherboard menghubungkan semua komponen.",
                cpu: "CPU adalah otak komputer.",
                cooler: "Cooler menjaga suhu CPU.",
                ram: "RAM 16GB+ untuk multitasking.",
                storage: "SSD 1TB untuk penyimpanan.",
                psu: "PSU 750W untuk daya yang cukup.",
                gpu: "GPU untuk rendering grafis.",
                case: "Case/Casing melindungi semua komponen dan memberikan airflow."
            }
        },

        // ===== GRADE 12: Advanced Computer Architecture =====
        {
            id: 11,
            mission: "Level 11: BIOS & Boot Process",
            hint: "BIOS/UEFI menginisialisasi hardware sebelum OS. Pasang Motherboard, CPU, RAM, Storage, PSU, lalu BIOS Chip!",
            concept: "BIOS/UEFI - Boot Sequence",
            required: ['motherboard', 'cpu', 'ram', 'storage', 'psu', 'bios-chip'],
            description: {
                motherboard: "Motherboard berisi chip BIOS.",
                cpu: "CPU menjalankan instruksi BIOS.",
                ram: "RAM menyimpan BIOS sementara.",
                storage: "Storage berisi bootloader OS.",
                psu: "PSU memberikan daya.",
                'bios-chip': "BIOS/UEFI adalah firmware yang menginisialisasi hardware dan memulai OS."
            }
        },
        {
            id: 12,
            mission: "Level 12: Binary & Data Representation",
            hint: "Semua data dalam komputer disimpan sebagai 0 dan 1!",
            concept: "Binary System - Digital Logic",
            required: ['cpu', 'alu', 'register', 'ram', 'storage'],
            description: {
                cpu: "CPU memproses data dalam format biner.",
                alu: "ALU (Arithmetic Logic Unit) melakukan operasi matematika dan logika.",
                register: "Register menyimpan data sementara di CPU (sangat cepat!).",
                ram: "RAM menyimpan data program (cepat tapi volatile).",
                storage: "Storage menyimpan data permanen (lambat tapi persistent)."
            }
        },
        {
            id: 13,
            mission: "Level 13: Memory Hierarchy",
            hint: "Hierarki memori: L1 Cache (tercepat) → L2 → L3 → RAM → Storage (terbesar). Pasang semua dari tercepat ke terbesar!",
            concept: "Cache & Memory Levels",
            required: ['cpu', 'l1-cache', 'l2-cache', 'l3-cache', 'ram', 'storage'],
            description: {
                cpu: "CPU membutuhkan data dengan cepat.",
                'l1-cache': "L1 Cache: Tercepat (1-2 cycles), terkecil (32KB).",
                'l2-cache': "L2 Cache: Cepat (4-10 cycles), kecil (256KB).",
                'l3-cache': "L3 Cache: Sedang (20-40 cycles), medium (8MB+).",
                ram: "RAM: Lebih lambat (100+ cycles), besar (GB).",
                storage: "Storage: Paling lambat (ms), terbesar (TB)."
            }
        },
        {
            id: 14,
            mission: "Level 14: Bus Architecture",
            hint: "Bus adalah jalur data yang menghubungkan semua komponen!",
            concept: "System Bus - Data Transfer",
            required: ['cpu', 'north-bridge', 'south-bridge', 'ram', 'gpu', 'storage', 'usb-controller'],
            description: {
                cpu: "CPU terhubung ke bus utama.",
                'north-bridge': "North Bridge: Menghubungkan CPU ke RAM dan GPU (kecepatan tinggi).",
                'south-bridge': "South Bridge: Menghubungkan ke I/O devices (kecepatan rendah).",
                ram: "RAM terhubung via Memory Bus.",
                gpu: "GPU terhubung via PCIe Bus.",
                storage: "Storage terhubung via SATA Bus.",
                'usb-controller': "USB Controller mengelola perangkat USB."
            }
        },
        {
            id: 15,
            mission: "Level 15: Complete System + OS!",
            hint: "Grand Build! Rakit semua hardware, lalu \"install\" OS. Tanpa OS, hardware hanyalah besi mati. OS mengelola semua resource!",
            concept: "Full System Architecture",
            required: ['motherboard', 'cpu', 'cooler', 'ram', 'gpu', 'storage', 'psu', 'case', 'os-installer'],
            description: {
                motherboard: "Platform utama semua komponen.",
                cpu: "Otak komputer.",
                cooler: "Sistem pendingin.",
                ram: "Memory utama.",
                gpu: "Pemroses grafis.",
                storage: "Penyimpanan data.",
                psu: "Sumber daya.",
                case: "Casing pelindung.",
                'os-installer': "Operating System (Windows/Linux/macOS) mengelola semua hardware dan menjalankan aplikasi."
            }
        }
    ];

    // Component data with Lottie animation keys
    const componentData = {
        cpu: { lottie: 'comp-cpu', name: 'CPU', color: '#0ea5e9' },
        ram: { lottie: 'comp-ram', name: 'RAM', color: '#22c55e' },
        storage: { lottie: 'comp-storage', name: 'Storage', color: '#f59e0b' },
        psu: { lottie: 'comp-psu', name: 'PSU', color: '#ef4444' },
        gpu: { lottie: 'comp-gpu', name: 'GPU', color: '#8b5cf6' },
        motherboard: { lottie: 'comp-motherboard', name: 'Motherboard', color: '#06b6d4' },
        cooler: { lottie: 'comp-cooler', name: 'Cooler', color: '#3b82f6' },
        keyboard: { lottie: 'comp-keyboard', name: 'Keyboard', color: '#64748b' },
        mouse: { lottie: 'comp-mouse', name: 'Mouse', color: '#64748b' },
        monitor: { lottie: 'comp-monitor', name: 'Monitor', color: '#a855f7' },
        case: { lottie: 'comp-case', name: 'Case', color: '#71717a' },
        // Grade 12 components
        'bios-chip': { lottie: 'comp-bios-chip', name: 'BIOS Chip', color: '#14b8a6' },
        alu: { lottie: 'comp-alu', name: 'ALU', color: '#f97316' },
        register: { lottie: 'comp-register', name: 'Register', color: '#ec4899' },
        'l1-cache': { lottie: 'comp-l1-cache', name: 'L1 Cache', color: '#eab308' },
        'l2-cache': { lottie: 'comp-l2-cache', name: 'L2 Cache', color: '#f59e0b' },
        'l3-cache': { lottie: 'comp-l3-cache', name: 'L3 Cache', color: '#d97706' },
        'north-bridge': { lottie: 'comp-north-bridge', name: 'North Bridge', color: '#6366f1' },
        'south-bridge': { lottie: 'comp-south-bridge', name: 'South Bridge', color: '#8b5cf6' },
        'usb-controller': { lottie: 'comp-usb-controller', name: 'USB Controller', color: '#64748b' },
        'os-installer': { lottie: 'comp-os-installer', name: 'OS Installer', color: '#0ea5e9' }
    };

    // Helper: create a Lottie container placeholder HTML (actual init happens after DOM insertion)
    let compLottieIdCounter = 0;
    function compLottieHtml(lottieKey, sizeClass) {
        const cid = `comp-lottie-${++compLottieIdCounter}`;
        return { html: `<div id="${cid}" class="${sizeClass}" data-lottie-anim="${lottieKey}"></div>`, id: cid };
    }

    // Helper: initialize all pending Lottie containers within a parent element
    function initLottiesIn(parentEl, scope) {
        if (typeof LottieManager === 'undefined') return;
        const containers = parentEl.querySelectorAll('[data-lottie-anim]');
        containers.forEach(c => {
            const animName = c.dataset.lottieAnim;
            if (animName) {
                LottieManager.create(c, animName, { lazy: false });
                c.removeAttribute('data-lottie-anim'); // prevent re-init
            }
        });
    }

    // ============================================
    // STATE
    // ============================================

    let currentLevel = null;
    let placedComponents = {};
    let isBooting = false;
    let dragDropInitialized = false;
    let hintsUsed = 0;
    let selectedComponentType = null;
    let validationErrors = 0;

    const HINT_ICON = '<svg class="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>';
    const DEFAULT_CONTROL_HINT = 'Drag komponen ke slot, atau tap komponen lalu tap slot. Tap slot yang sudah terisi untuk melepas komponen.';

    function getSmaTrackLabel(levelId) {
        if (levelId <= 5) return 'Fase E SMA - Dasar hardware';
        if (levelId <= 10) return 'Fase E SMA - Integrasi sistem';
        return 'Fase F SMA - Arsitektur lanjut';
    }

    function buildLevelObjectives(level) {
        const objectives = [
            'Mencocokkan fungsi komponen dengan slot perangkat keras yang benar.'
        ];

        if (level.required.includes('keyboard') || level.required.includes('mouse') || level.required.includes('monitor')) {
            objectives.push('Membedakan perangkat input, proses, dan output pada satu sistem komputer.');
        }
        if (level.required.includes('bios-chip') || level.required.includes('os-installer')) {
            objectives.push('Menjelaskan urutan booting: firmware, hardware check, lalu sistem operasi.');
        }
        if (level.required.includes('l1-cache') || level.required.includes('l2-cache') || level.required.includes('l3-cache')) {
            objectives.push('Mengurutkan hierarki memori dari cache, RAM, hingga storage.');
        }
        if (level.required.includes('north-bridge') || level.required.includes('south-bridge')) {
            objectives.push('Menjelaskan aliran data antarkomponen melalui bus sistem.');
        }
        if (level.required.includes('gpu') && !level.required.includes('monitor')) {
            objectives.push('Menjelaskan pembagian kerja CPU dan GPU untuk performa aplikasi.');
        }

        return objectives.slice(0, 3);
    }

    function renderLearningTargets() {
        const gradeEl = document.getElementById('computer-grade-focus');
        if (gradeEl) {
            gradeEl.textContent = getSmaTrackLabel(currentLevel.id);
        }

        const listEl = document.getElementById('computer-objectives');
        if (!listEl) return;

        const objectives = buildLevelObjectives(currentLevel);
        listEl.innerHTML = objectives.map(item => `<li>${item}</li>`).join('');
    }

    function updateAssemblyProgress() {
        const chip = document.getElementById('computer-progress-chip');
        if (!chip || !currentLevel) return;
        const placedCount = Object.keys(placedComponents).length;
        chip.textContent = `${placedCount}/${currentLevel.required.length} terpasang`;
    }

    function updateControlHint(text) {
        const controlHint = document.getElementById('computer-control-hint');
        if (!controlHint) return;
        controlHint.textContent = text || DEFAULT_CONTROL_HINT;
    }

    function setSelectedComponent(componentType) {
        selectedComponentType = componentType || null;
        document.querySelectorAll('.component-item').forEach((item) => {
            const isSelected = !!selectedComponentType && item.dataset.component === selectedComponentType;
            item.classList.toggle('selected', isSelected);
        });

        if (selectedComponentType) {
            const selectedName = componentData[selectedComponentType]?.name || selectedComponentType;
            updateControlHint(`Mode tap aktif: ${selectedName} dipilih. Tap slot tujuan untuk memasang.`);
        } else {
            updateControlHint();
        }
    }

    function getZoneText(zone) {
        if (zone === 'external') return 'External I/O';
        if (zone === 'case') return 'Inside PC Case';
        return 'Motherboard';
    }

    function buildSlotContent(comp, data, difficulty, zone, slotNum) {
        let slotContent = '';
        if (difficulty === 'easy') {
            const { html: ghostHtml } = compLottieHtml(data.lottie || comp, 'flex items-center justify-center opacity-20');
            slotContent = `<span class="flex items-center justify-center" style="width:80%;height:65%;">${ghostHtml}</span>`;
        } else if (difficulty === 'medium') {
            const { html: ghostHtml } = compLottieHtml(data.lottie || comp, 'flex items-center justify-center opacity-10');
            slotContent = `<span class="flex items-center justify-center" style="width:80%;height:65%;">${ghostHtml}</span>`;
        } else {
            slotContent = '<span class="flex items-center justify-center opacity-60 text-2xl text-dark-400">?</span>';
        }

        const zoneText = getZoneText(zone);
        const slotName = getSlotDisplayName(comp);
        const labelText = difficulty === 'hard' ? `Slot ${slotNum}` : slotName;
        slotContent += `<span class="slot-zone-tag">${zoneText}</span>`;
        slotContent += `<span class="slot-label text-dark-500" style="font-size: 0.6rem;">${labelText}</span>`;
        return slotContent;
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    function init(levelNum) {
        currentLevel = levels[levelNum - 1] || levels[0];
        placedComponents = {};
        isBooting = false;
        hintsUsed = 0;
        selectedComponentType = null;
        validationErrors = 0;

        document.getElementById('computer-level').textContent = levelNum;
        document.getElementById('computer-mission').textContent = currentLevel.mission;

        // Update hint and concept if elements exist
        const hintEl = document.getElementById('computer-hint');
        if (hintEl) hintEl.textContent = currentLevel.hint;

        const conceptEl = document.getElementById('computer-concept');
        if (conceptEl) conceptEl.textContent = currentLevel.concept;

        renderLearningTargets();

        renderComponentPalette();
        resetMotherboard();
        hideFeedback('computer-feedback');
        updateControlHint();

        setupDragDrop();
        setupControls();

        animateMotherboardEntrance();
    }

    // ============================================
    // ANIME.JS ANIMATIONS
    // ============================================

    function animateMotherboardEntrance() {
        anime({
            targets: '.motherboard',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutElastic(1, .8)'
        });

        anime({
            targets: '.case-interior',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 600,
            delay: 100,
            easing: 'easeOutElastic(1, .8)'
        });

        anime({
            targets: '.external-zone',
            scale: [0.9, 1],
            opacity: [0, 1],
            duration: 500,
            delay: 180,
            easing: 'easeOutQuad'
        });

        anime({
            targets: '.component-slot',
            scale: [0, 1],
            opacity: [0, 1],
            delay: anime.stagger(100, { start: 300 }),
            duration: 400,
            easing: 'easeOutBack'
        });

        anime({
            targets: '.component-item',
            translateX: [-50, 0],
            opacity: [0, 1],
            delay: anime.stagger(80, { start: 200 }),
            duration: 500,
            easing: 'easeOutQuad'
        });
    }

    function animateComponentPlacement(slot, isCorrect) {
        anime({
            targets: slot,
            scale: [1.3, 1],
            duration: 400,
            easing: 'easeOutElastic(1, .5)'
        });

        if (isCorrect) {
            anime({
                targets: slot,
                boxShadow: ['0 0 0px rgba(34, 197, 94, 0)', '0 0 30px rgba(34, 197, 94, 0.8)', '0 0 15px rgba(34, 197, 94, 0.4)'],
                duration: 600,
                easing: 'easeOutQuad'
            });
        } else {
            anime({
                targets: slot,
                boxShadow: ['0 0 0px rgba(239, 68, 68, 0)', '0 0 30px rgba(239, 68, 68, 0.8)', '0 0 0px rgba(239, 68, 68, 0)'],
                duration: 600,
                easing: 'easeOutQuad'
            });
        }
    }

    function animateBootSequence() {
        const slots = document.querySelectorAll('.component-slot.filled');
        if (!slots.length) return Promise.resolve();

        return new Promise(resolve => {
            anime
                .timeline({ complete: resolve })
                .add({
                    targets: slots,
                    backgroundColor: 'rgba(34, 197, 94, 0.55)',
                    boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 18px rgba(34, 197, 94, 0.65)'],
                    delay: anime.stagger(120),
                    duration: 220,
                    easing: 'easeOutSine'
                })
                .add({
                    targets: slots,
                    backgroundColor: 'rgba(34, 197, 94, 0.25)',
                    boxShadow: '0 0 6px rgba(34, 197, 94, 0.25)',
                    delay: anime.stagger(90),
                    duration: 220,
                    easing: 'easeInOutSine'
                });
        });
    }

    function animatePowerOn() {
        const mb = document.querySelector('.motherboard');
        if (!mb) return Promise.resolve();

        return new Promise(resolve => {
            // LED blink effect
            anime({
                targets: '.led-indicator',
                opacity: [0, 1],
                scale: [0.5, 1.2, 1],
                duration: 500,
                easing: 'easeOutElastic(1, .5)'
            });

            // Screen flicker effect
            anime({
                targets: '#computer-screen',
                opacity: [0, 1, 0.8, 1],
                duration: 800,
                easing: 'steps(4)',
                complete: resolve
            });
        });
    }

    function animateSuccess() {
        anime({
            targets: '.motherboard',
            scale: [1, 1.05, 1],
            duration: 600,
            easing: 'easeOutElastic(1, .5)'
        });

        // Confetti-like particles
        const container = document.querySelector('.motherboard');
        if (container) {
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: ${['#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6'][i % 4]};
                    border-radius: 50%;
                    pointer-events: none;
                    left: 50%;
                    top: 50%;
                `;
                container.appendChild(particle);

                anime({
                    targets: particle,
                    translateX: anime.random(-150, 150),
                    translateY: anime.random(-150, 150),
                    scale: [1, 0],
                    opacity: [1, 0],
                    duration: 1000,
                    easing: 'easeOutExpo',
                    complete: () => particle.remove()
                });
            }
        }
    }

    // ============================================
    // COMPONENT PALETTE
    // ============================================

    function renderComponentPalette() {
        const palette = document.getElementById('component-palette');
        // Destroy existing Lottie instances in palette
        if (typeof LottieManager !== 'undefined') LottieManager.destroyInScope('#component-palette');

        palette.innerHTML = '<h4 class="font-display font-bold text-dark-100 mb-4"><svg class="inline w-5 h-5 mr-1 -mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/></svg>Komponen</h4>';

        currentLevel.required.forEach(comp => {
            const data = componentData[comp] || { lottie: null, name: comp, color: '#666' };
            const desc = currentLevel.description && currentLevel.description[comp] ? currentLevel.description[comp] : '';
            const item = document.createElement('div');
            item.className = 'component-item flex items-center gap-3 mb-3 group relative';
            item.draggable = true;
            item.dataset.component = comp;

            const { html: lottieHtml } = compLottieHtml(data.lottie || comp, 'w-16 h-16 flex-shrink-0');

            item.innerHTML = `
                ${lottieHtml}
                <div class="flex-1 min-w-0">
                    <span class="font-medium block">${data.name}</span>
                    <span class="text-xs text-dark-300">Drag atau tap</span>
                </div>
                ${desc ? `<div class="comp-tooltip hidden group-hover:block absolute left-full ml-2 top-0 z-50 w-52 p-3 rounded-xl bg-dark-800 border border-dark-500 shadow-xl text-xs text-dark-100 leading-relaxed pointer-events-none">
                    <span class="font-bold text-accent-400 block mb-1">Info ${data.name}</span>
                    ${desc}
                </div>` : ''}
            `;

            if (selectedComponentType === comp) {
                item.classList.add('selected');
            }

            item.addEventListener('click', () => {
                if (isBooting || item.classList.contains('used')) return;
                if (selectedComponentType === comp) {
                    setSelectedComponent(null);
                    return;
                }
                setSelectedComponent(comp);
            });

            palette.appendChild(item);
        });

        // Initialize all Lottie animations in the palette
        initLottiesIn(palette, 'comp-palette');
    }

    // ============================================
    // MOTHERBOARD
    // ============================================

    // Motherboard layout positions (percentage based, like a real motherboard)
    const mbLayout = {
        'cpu':            { top: '12%', left: '30%', w: '130px', h: '120px' },
        'cooler':         { top: '5%',  left: '58%', w: '120px', h: '110px' },
        'ram':            { top: '12%', left: '72%', w: '80px',  h: '140px' },
        'gpu':            { top: '55%', left: '25%', w: '180px', h: '100px' },
        // Grade 12 - on motherboard
        'bios-chip':      { top: '70%', left: '60%', w: '110px', h: '90px' },
        'alu':            { top: '12%', left: '5%',  w: '120px', h: '100px' },
        'register':       { top: '35%', left: '5%',  w: '120px', h: '100px' },
        'l1-cache':       { top: '5%',  left: '20%', w: '100px', h: '85px' },
        'l2-cache':       { top: '5%',  left: '42%', w: '100px', h: '85px' },
        'l3-cache':       { top: '5%',  left: '72%', w: '100px', h: '85px' },
        'north-bridge':   { top: '35%', left: '30%', w: '130px', h: '110px' },
        'south-bridge':   { top: '55%', left: '55%', w: '130px', h: '110px' },
        'usb-controller': { top: '70%', left: '5%',  w: '120px', h: '90px' }
    };

    // PC Case interior layout positions
    const caseLayout = {
        'psu':            { top: '68%', left: '5%',  w: '55%',  h: '90px' },
        'storage':        { top: '8%',  left: '60%', w: '35%',  h: '90px' },
        'motherboard':    { top: '25%', left: '5%',  w: '50%',  h: '100px' },
        'case':           { top: '8%',  left: '5%',  w: '50%',  h: '90px' },
        'keyboard':       { top: '25%', left: '55%', w: '40%',  h: '85px' },
        'mouse':          { top: '45%', left: '60%', w: '35%',  h: '85px' },
        'monitor':        { top: '45%', left: '5%',  w: '50%',  h: '100px' },
        'os-installer':   { top: '68%', left: '60%', w: '35%',  h: '90px' }
    };

    // External peripherals/software panel layout
    const externalLayout = {
        'monitor':      { top: '10%', left: '5%',  w: '45%', h: '90px' },
        'keyboard':     { top: '10%', left: '52%', w: '43%', h: '90px' },
        'mouse':        { top: '55%', left: '5%',  w: '45%', h: '80px' },
        'os-installer': { top: '55%', left: '52%', w: '43%', h: '80px' }
    };

    function getZoneForComponent(component) {
        if (typeof ComputerLearningRules !== 'undefined' && typeof ComputerLearningRules.getComponentZone === 'function') {
            return ComputerLearningRules.getComponentZone(component);
        }
        if (['psu', 'storage', 'motherboard', 'case'].includes(component)) return 'case';
        if (['keyboard', 'mouse', 'monitor', 'os-installer'].includes(component)) return 'external';
        return 'motherboard';
    }

    function getSlotDisplayName(slotType) {
        if (typeof ComputerLearningRules !== 'undefined' && typeof ComputerLearningRules.getSlotDisplayName === 'function') {
            return ComputerLearningRules.getSlotDisplayName(slotType);
        }
        return slotType;
    }

    // Smart grid fallback: auto-arrange components in a grid if no layout defined
    function getGridPositions(components) {
        const cols = Math.min(components.length, 4);
        const positions = {};
        components.forEach((comp, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const gapX = 100 / (cols + 1);
            const gapY = 100 / (Math.ceil(components.length / cols) + 1);
            positions[comp] = {
                top: `${(row + 1) * gapY - 5}%`,
                left: `${(col + 1) * gapX - 8}%`,
                w: '130px',
                h: '110px'
            };
        });
        return positions;
    }

    function updateCaseImage(state) {
        const caseLottie = document.getElementById('case-lottie');
        const caseStatus = document.getElementById('case-status');
        if (!caseLottie || !caseStatus) return;

        // Destroy previous Lottie in the container
        if (typeof LottieManager !== 'undefined') {
            LottieManager.destroyInScope(caseLottie);
        }
        caseLottie.innerHTML = '';

        // Map state to Lottie animation name
        let animName;
        switch (state) {
            case 'off':
                animName = 'case-off';
                caseStatus.innerHTML = '<svg class="w-3 h-3 inline-block" viewBox="0 0 20 20" fill="#4b5563"><circle cx="10" cy="10" r="8"/></svg> Power Off';
                caseStatus.className = 'text-xs text-dark-300 mt-3 font-semibold text-center';
                break;
            case 'on':
                animName = 'case-on';
                caseStatus.innerHTML = '<svg class="w-3 h-3 inline-block" viewBox="0 0 20 20" fill="#22c55e"><circle cx="10" cy="10" r="8"/></svg> Power On - Berhasil!';
                caseStatus.className = 'text-xs text-green-400 mt-3 font-bold text-center';
                break;
            case 'error':
                animName = 'case-error';
                caseStatus.innerHTML = '<svg class="w-3 h-3 inline-block" viewBox="0 0 20 20" fill="#ef4444"><circle cx="10" cy="10" r="8"/></svg> Error - Komponen salah!';
                caseStatus.className = 'text-xs text-red-400 mt-3 font-bold text-center';
                break;
            case 'booting':
                animName = 'case-on';
                caseStatus.innerHTML = '<svg class="w-3 h-3 inline-block" viewBox="0 0 20 20" fill="#eab308"><circle cx="10" cy="10" r="8"/></svg> Booting...';
                caseStatus.className = 'text-xs text-yellow-400 mt-3 font-bold text-center animate-pulse';
                break;
            default:
                animName = 'case-off';
        }

        // Create new Lottie animation
        if (typeof LottieManager !== 'undefined') {
            LottieManager.create(caseLottie, animName, {
                loop: true,
                autoplay: true
            });
        }

        // Animate case change
        if (typeof anime !== 'undefined') {
            anime({
                targets: caseLottie,
                scale: [0.95, 1.05, 1],
                duration: 500,
                easing: 'easeOutElastic(1, .8)'
            });
        }
    }

    function getSlotDifficulty() {
        // Returns: 'easy' (1-5), 'medium' (6-10), 'hard' (11-15)
        const id = currentLevel.id;
        if (id <= 5) return 'easy';
        if (id <= 10) return 'medium';
        return 'hard';
    }

    function resetMotherboard() {
        const mbSlots = document.getElementById('motherboard-slots');
        const caseSlots = document.getElementById('case-slots');
        const externalSlots = document.getElementById('external-slots');
        const mbLottieBg = document.getElementById('motherboard-lottie-bg');
        const caseLottieBg = document.getElementById('case-interior-lottie-bg');
        const caseLottie = document.getElementById('case-lottie');
        // Destroy existing Lottie instances before clearing
        if (typeof LottieManager !== 'undefined') {
            LottieManager.destroyInScope(mbSlots);
            if (caseSlots) LottieManager.destroyInScope(caseSlots);
            if (externalSlots) LottieManager.destroyInScope(externalSlots);
            if (mbLottieBg) LottieManager.destroyInScope(mbLottieBg);
            if (caseLottieBg) LottieManager.destroyInScope(caseLottieBg);
            if (caseLottie) LottieManager.destroyInScope(caseLottie);
        }
        mbSlots.innerHTML = '';
        if (caseSlots) caseSlots.innerHTML = '';
        if (externalSlots) externalSlots.innerHTML = '';

        // Initialize Lottie backgrounds
        if (typeof LottieManager !== 'undefined') {
            if (mbLottieBg) {
                mbLottieBg.innerHTML = '';
                LottieManager.create(mbLottieBg, 'bg-motherboard', { loop: true, autoplay: true });
            }
            if (caseLottieBg) {
                caseLottieBg.innerHTML = '';
                LottieManager.create(caseLottieBg, 'bg-pccase', { loop: true, autoplay: true });
            }
        }
        placedComponents = {};
        validationErrors = 0;

        // Calculate positions for this level's components
        const positions = getGridPositions(currentLevel.required);
        const difficulty = getSlotDifficulty();

        // Split components by zone
        const moboComps = currentLevel.required.filter(c => getZoneForComponent(c) === 'motherboard');
        const caseComps = currentLevel.required.filter(c => getZoneForComponent(c) === 'case');
        const externalComps = currentLevel.required.filter(c => getZoneForComponent(c) === 'external');

        // Auto-grid for case components
        const casePositions = getGridPositions(caseComps);
        const externalPositions = getGridPositions(externalComps);

        // Create slots for motherboard components
        let slotNum = 1;
        moboComps.forEach(comp => {
            const data = componentData[comp] || { lottie: null, name: comp, color: '#666' };
            const pos = mbLayout[comp] || positions[comp] || { top: '10%', left: '10%', w: '130px', h: '110px' };
            const slot = createSlot(comp, data, pos, slotNum, difficulty, 'motherboard');
            mbSlots.appendChild(slot);
            slotNum++;
        });

        // Create slots for case components
        caseComps.forEach(comp => {
            const data = componentData[comp] || { lottie: null, name: comp, color: '#666' };
            const pos = caseLayout[comp] || casePositions[comp] || { top: '10%', left: '10%', w: '130px', h: '100px' };
            const slot = createSlot(comp, data, pos, slotNum, difficulty, 'case');
            if (caseSlots) caseSlots.appendChild(slot);
            slotNum++;
        });

        // Create slots for external/peripheral components
        externalComps.forEach(comp => {
            const data = componentData[comp] || { lottie: null, name: comp, color: '#666' };
            const pos = externalLayout[comp] || externalPositions[comp] || { top: '10%', left: '10%', w: '130px', h: '90px' };
            const slot = createSlot(comp, data, pos, slotNum, difficulty, 'external');
            if (externalSlots) externalSlots.appendChild(slot);
            slotNum++;
        });

        // Initialize Lottie animations in the slot ghost icons
        initLottiesIn(mbSlots, 'comp-mb-slots');
        if (caseSlots) initLottiesIn(caseSlots, 'comp-case-slots');
        if (externalSlots) initLottiesIn(externalSlots, 'comp-external-slots');

        // Show/hide case interior based on whether level has case components
        const caseInterior = document.getElementById('case-interior');
        if (caseInterior) {
            caseInterior.style.display = caseComps.length > 0 ? '' : 'none';
        }
        const externalPanel = document.getElementById('external-zone-panel');
        if (externalPanel) {
            externalPanel.style.display = externalComps.length > 0 ? '' : 'none';
        }

        setSelectedComponent(null);
        updateAssemblyProgress();

        // Update hint counter display
        updateHintButton();

        // Reset case to off state
        updateCaseImage('off');
    }

    function createSlot(comp, data, pos, slotNum, difficulty, zone) {
        const slot = document.createElement('div');
        slot.className = 'component-slot';
        slot.dataset.slot = comp;
        slot.dataset.slotNum = slotNum;
        slot.dataset.zone = zone || 'motherboard';
        slot.style.position = 'absolute';
        slot.style.top = pos.top;
        slot.style.left = pos.left;
        slot.style.width = pos.w;
        slot.style.height = pos.h;

        slot.innerHTML = buildSlotContent(comp, data, difficulty, zone, slotNum);
        const slotName = getSlotDisplayName(comp);
        const zoneText = getZoneText(zone);
        slot.setAttribute('title', `${slotName} (${zoneText})`);
        return slot;
    }

    function placeComponent(componentType, slotType) {
        const slot = document.querySelector(`.component-slot[data-slot="${slotType}"]`);
        if (!slot || slot.classList.contains('filled')) return false;

        const data = componentData[componentType] || { lottie: null, name: componentType, color: '#666' };
        const isCorrect = componentType === slotType;

        // Destroy any existing Lottie in this slot
        if (typeof LottieManager !== 'undefined') LottieManager.destroyInScope(slot);

        const { html: lottieHtml } = compLottieHtml(data.lottie || componentType, 'flex items-center justify-center');

        slot.classList.remove('correct', 'incorrect', 'hint-revealed');
        slot.classList.add('filled');
        slot.innerHTML = `
            <span class="flex items-center justify-center" style="width:80%;height:65%;">${lottieHtml}</span>
            <span class="slot-zone-tag">${getZoneText(slot.dataset.zone)}</span>
            <span class="slot-label" style="color: #94a3b8">${data.name}</span>
        `;

        // Initialize Lottie in the placed slot
        initLottiesIn(slot, 'comp-slot');

        placedComponents[slotType] = { type: componentType, correct: isCorrect };
        if (typeof SoundManager !== 'undefined') SoundManager.play('place');

        animateComponentPlacement(slot, true); // Always animate positively on place

        // Disable the component in palette
        const paletteItem = document.querySelector(`.component-item[data-component="${componentType}"]`);
        if (paletteItem) {
            paletteItem.classList.add('used');
            paletteItem.draggable = false;
            anime({
                targets: paletteItem,
                opacity: 0.4,
                scale: 0.95,
                duration: 300,
                easing: 'easeOutQuart'
            });
        }

        if (selectedComponentType === componentType) {
            setSelectedComponent(null);
        }

        updateHintButton();
        updateAssemblyProgress();

        // Show a neutral "component placed" message - no right/wrong
        const targetLabel = getSlotDisplayName(slotType);
        showFeedback('computer-feedback', `${data.name} ditempatkan pada area <b>${targetLabel}</b>. Tekan Power On untuk validasi akhir.`, true, true);

        return true;
    }

    function removeComponentFromSlot(slotType) {
        const slot = document.querySelector(`.component-slot[data-slot="${slotType}"]`);
        const placed = placedComponents[slotType];
        if (!slot || !placed) return false;

        if (typeof LottieManager !== 'undefined') {
            LottieManager.destroyInScope(slot);
        }

        delete placedComponents[slotType];

        const zone = slot.dataset.zone || 'motherboard';
        const slotNum = Number(slot.dataset.slotNum || 0);
        const difficulty = getSlotDifficulty();
        const slotData = componentData[slotType] || { lottie: null, name: slotType };
        slot.className = 'component-slot';
        slot.innerHTML = buildSlotContent(slotType, slotData, difficulty, zone, slotNum);
        slot.setAttribute('title', `${getSlotDisplayName(slotType)} (${getZoneText(zone)})`);
        initLottiesIn(slot, 'comp-slot');

        const paletteItem = document.querySelector(`.component-item[data-component="${placed.type}"]`);
        if (paletteItem) {
            paletteItem.classList.remove('used');
            paletteItem.draggable = true;
            anime({
                targets: paletteItem,
                opacity: [0.4, 1],
                scale: [0.95, 1],
                duration: 220,
                easing: 'easeOutQuad'
            });
        }

        updateHintButton();
        updateAssemblyProgress();
        showFeedback('computer-feedback', 'Komponen dilepas dari slot. Pilih komponen lain untuk dipasang.', true);
        return true;
    }

    // ============================================
    // DRAG & DROP
    // ============================================

    function setupDragDrop() {
        if (dragDropInitialized) return;
        dragDropInitialized = true;

        const palette = document.getElementById('component-palette');
        const mbArea = document.getElementById('motherboard-slots');
        const caseArea = document.getElementById('case-slots');
        const externalArea = document.getElementById('external-slots');

        palette.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.component-item');
            if (item && !item.classList.contains('used')) {
                e.dataTransfer.setData('text/plain', item.dataset.component);
                item.style.opacity = '0.5';
            }
        });

        palette.addEventListener('dragend', (e) => {
            const item = e.target.closest('.component-item');
            if (item) item.style.opacity = '';
        });

        // Handle drag-drop for both motherboard and case zones
        [mbArea, caseArea, externalArea].forEach(area => {
            if (!area) return;
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                const slot = e.target.closest('.component-slot');
                if (slot && !slot.classList.contains('filled')) {
                    slot.classList.add('drag-over');
                }
            });

            area.addEventListener('dragleave', (e) => {
                const slot = e.target.closest('.component-slot');
                if (slot) slot.classList.remove('drag-over');
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                const slot = e.target.closest('.component-slot');
                if (slot) {
                    slot.classList.remove('drag-over');
                    const componentType = e.dataTransfer.getData('text/plain');
                    const slotType = slot.dataset.slot;
                    if (componentType && slotType) {
                        if (slot.classList.contains('filled')) {
                            removeComponentFromSlot(slotType);
                        }
                        placeComponent(componentType, slotType);
                    }
                }
            });

            area.addEventListener('click', (e) => {
                const slot = e.target.closest('.component-slot');
                if (!slot || isBooting) return;

                const slotType = slot.dataset.slot;
                if (!slotType) return;

                if (slot.classList.contains('filled')) {
                    removeComponentFromSlot(slotType);
                    return;
                }

                if (!selectedComponentType) {
                    showFeedback('computer-feedback', 'Pilih komponen dulu dari panel kiri, lalu tap slot tujuan.', true);
                    return;
                }

                placeComponent(selectedComponentType, slotType);
            });
        });
    }

    // ============================================
    // HINT SYSTEM
    // ============================================

    function setHintButtonLabel(button, labelText) {
        if (!button) return;
        button.innerHTML = `${HINT_ICON} ${labelText}`;
    }

    function updateHintButton() {
        const hintBtn = document.getElementById('btn-hint-computer');
        if (hintBtn) {
            const unrevealedSlots = currentLevel.required.filter(comp => {
                const slot = document.querySelector(`.component-slot[data-slot="${comp}"]`);
                return slot && !slot.classList.contains('filled') && !slot.classList.contains('hint-revealed');
            });
            if (unrevealedSlots.length === 0) {
                hintBtn.disabled = true;
                setHintButtonLabel(hintBtn, 'Hint habis');
            } else {
                hintBtn.disabled = false;
                setHintButtonLabel(hintBtn, `Hint (${hintsUsed} dipakai)`);
            }
        }
    }

    function revealHint() {
        if (isBooting) return;
        
        // Find slots that haven't been revealed or filled
        const unrevealedSlots = currentLevel.required.filter(comp => {
            const slot = document.querySelector(`.component-slot[data-slot="${comp}"]`);
            return slot && !slot.classList.contains('filled') && !slot.classList.contains('hint-revealed');
        });

        if (unrevealedSlots.length === 0) {
            showFeedback('computer-feedback', 'Semua slot sudah terbuka. Tinggal cocokkan komponennya.', true);
            return;
        }

        // Reveal one random slot's name
        const randomSlot = unrevealedSlots[Math.floor(Math.random() * unrevealedSlots.length)];
        const slot = document.querySelector(`.component-slot[data-slot="${randomSlot}"]`);
        const data = componentData[randomSlot] || { name: randomSlot, icon: 'Tidak diketahui' };

        if (slot) {
            slot.classList.add('hint-revealed');
            const label = slot.querySelector('.slot-label');
            if (label) {
                label.textContent = data.name;
                label.style.color = '#fbbf24';
                label.style.fontSize = '0.7rem';
            }
            
            // Flash animation on revealed slot
            anime({
                targets: slot,
                borderColor: ['#fbbf24', '#475569'],
                backgroundColor: ['rgba(251, 191, 36, 0.2)', 'rgba(15, 23, 42, 0.8)'],
                duration: 1500,
                easing: 'easeOutQuart'
            });

            hintsUsed++;
            showFeedback('computer-feedback', `Hint: slot tersebut untuk <b>${data.name}</b>. Total hint dipakai: ${hintsUsed}.`, true, true);
        }

        updateHintButton();
    }

    // ============================================
    // CONTROLS
    // ============================================

    function setupControls() {
        const buttons = ['btn-clear-computer', 'btn-power-computer', 'btn-hint-computer'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.replaceWith(btn.cloneNode(true));
        });

        document.getElementById('btn-clear-computer').addEventListener('click', () => {
            if (!isBooting) {
                renderComponentPalette();
                resetMotherboard();
                hideFeedback('computer-feedback');
                animateMotherboardEntrance();
            }
        });

        document.getElementById('btn-power-computer').addEventListener('click', powerOn);

        const hintBtn = document.getElementById('btn-hint-computer');
        if (hintBtn) {
            hintBtn.addEventListener('click', revealHint);
        }

        updateHintButton();
    }

    // ============================================
    // POWER ON & VALIDATION
    // ============================================

    async function powerOn() {
        if (isBooting) return;

        const requiredCount = currentLevel.required.length;
        const placedCount = Object.keys(placedComponents).length;

        if (placedCount < requiredCount) {
            validationErrors += 1;
            showFeedback('computer-feedback', `Belum lengkap! Pasang semua ${requiredCount} komponen.`, false);
            anime({
                targets: ['#motherboard-slots', '#case-slots', '#external-slots'],
                translateX: [-5, 5, -5, 5, 0],
                duration: 400,
                easing: 'easeInOutSine'
            });
            return;
        }

        // Reset previous validation markers, then reveal current validation
        document.querySelectorAll('.component-slot').forEach((slot) => {
            slot.classList.remove('correct', 'incorrect');
        });

        Object.entries(placedComponents).forEach(([slotType, info]) => {
            const slot = document.querySelector(`.component-slot[data-slot="${slotType}"]`);
            if (slot) {
                slot.classList.add(info.correct ? 'correct' : 'incorrect');
                const label = slot.querySelector('.slot-label');
                if (label) {
                    label.style.color = info.correct ? '#22c55e' : '#ef4444';
                    label.textContent = info.correct 
                        ? `${componentData[info.type]?.name || info.type}` 
                        : `${componentData[info.type]?.name || info.type} (salah!)`;
                }
            }
        });

        // Check if all components are correctly placed
        const allCorrect = Object.values(placedComponents).every(c => c.correct);

        if (!allCorrect) {
            updateCaseImage('error');

            // Count wrong placements
            const wrongCount = Object.values(placedComponents).filter(c => !c.correct).length;
            validationErrors += Math.max(1, wrongCount);

            const issueSummary = typeof ComputerLearningRules !== 'undefined' && typeof ComputerLearningRules.analyzePlacementIssues === 'function'
                ? ComputerLearningRules.analyzePlacementIssues(placedComponents)
                : null;
            const summaryParts = [];
            if (issueSummary && issueSummary.zoneMismatch.length > 0) {
                summaryParts.push(`${issueSummary.zoneMismatch.length} salah zona`);
            }
            if (issueSummary && issueSummary.slotMismatch.length > 0) {
                summaryParts.push(`${issueSummary.slotMismatch.length} salah slot`);
            }

            const wrongHints = typeof ComputerLearningRules !== 'undefined' && typeof ComputerLearningRules.buildWrongPlacementHints === 'function'
                ? ComputerLearningRules.buildWrongPlacementHints(placedComponents)
                : [];
            const detail = wrongHints.length
                ? `<div class="text-left text-xs mt-2 p-3 bg-dark-900/40 rounded-xl">${wrongHints.slice(0, 4).map(h => `• ${h}`).join('<br>')}</div>`
                : '';
            const summaryText = summaryParts.length
                ? `Validasi gagal: ${summaryParts.join(', ')}.`
                : `${wrongCount} komponen belum tepat.`;
            const actionText = '<div class="text-xs mt-2 text-dark-200">Tap slot yang sudah terisi untuk melepas komponen, lalu pasang ulang.</div>';
            showFeedback('computer-feedback', `${summaryText}${detail}${actionText}`, false, true);
            anime({
                targets: '.component-slot.incorrect',
                translateX: [-5, 5, -5, 5, 0],
                backgroundColor: ['rgba(239, 68, 68, 0.5)', 'rgba(239, 68, 68, 0.2)'],
                duration: 400,
                easing: 'easeInOutSine'
            });
            return;
        }

        isBooting = true;
        updateCaseImage('booting');
        if (typeof SoundManager !== 'undefined') SoundManager.play('powerOn');
        showFeedback('computer-feedback', 'Simulasi Menyalakan komputer...', true);

        await animateBootSequence();
        await animatePowerOn();

        updateCaseImage('on');
        animateSuccess();

        // Show educational summary of all components
        const descList = currentLevel.required
            .filter(comp => currentLevel.description && currentLevel.description[comp])
            .map(comp => `<b>${componentData[comp]?.name || comp}</b>: ${currentLevel.description[comp]}`)
            .join('<br>');

        const objectiveList = buildLevelObjectives(currentLevel)
            .map(item => `• ${item}`)
            .join('<br>');

        const hintPenalty = hintsUsed > 0 ? `${hintsUsed} hint dipakai.` : 'Tanpa hint.';
        showFeedback('computer-feedback', 
            `Komputer berhasil dirakit dan menyala! ${hintPenalty}<br><br>
            <div class="text-left text-xs mt-2 p-3 bg-dark-800/50 rounded-xl leading-relaxed">
                <span class="font-bold text-accent-400">Materi yang dipelajari:</span><br>${descList}<br><br>
                <span class="font-bold text-purple-300">Refleksi kompetensi SMA:</span><br>${objectiveList}
            </div>`, true, true);

        setTimeout(() => {
            completeLevel('computer', {
                timeTaken: typeof ProgressSystem !== 'undefined' ? ProgressSystem.getLevelTime() : 0,
                hintsUsed: hintsUsed,
                errorsOccurred: validationErrors
            });
            isBooting = false;
        }, 2500);
    }

    // ============================================
    // PUBLIC API
    // ============================================

    return {
        init,
        getLevelCount: () => levels.length
    };
})();
