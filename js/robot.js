/**
 * INFORMATIKA LAB ADVENTURE
 * Mode 1: Robot Logic Adventure
 * Konsep: Sequence, Algoritma, Loop, Conditional Logic
 * 10 Levels with Progressive Difficulty
 */

const RobotGame = (() => {
    // ============================================
    // LEVEL DATA - 10 LEVELS
    // ============================================

    const levels = [
        // ===== BEGINNER: Basic Movement =====
        {
            id: 1,
            mission: "Level 1: Maju Ke Depan! Mulai",
            hint: "Gunakan perintah MAJU untuk menggerakkan robot ke bendera.",
            concept: "Sequence - Urutan Perintah",
            grid: [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                ['S', 0, 0, 'G', 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ],
            startDirection: 'right',
            solution: ['forward', 'forward', 'forward'],
            minCommands: 3
        },
        {
            id: 2,
            mission: "Level 2: Langkah Lebih Jauh!",
            hint: "Robot perlu lebih banyak langkah untuk mencapai tujuan.",
            concept: "Sequence - Urutan Lebih Panjang",
            grid: [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                ['S', 0, 0, 0, 'G'],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ],
            startDirection: 'right',
            solution: ['forward', 'forward', 'forward', 'forward'],
            minCommands: 4
        },

        // ===== EASY: Introducing Turns =====
        {
            id: 3,
            mission: "Level 3: Belajar Berbelok! Kiri",
            hint: "Gunakan KIRI atau KANAN untuk mengubah arah robot.",
            concept: "Turns - Mengubah Arah",
            grid: [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                ['S', 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 'G', 0]
            ],
            startDirection: 'right',
            solution: ['forward', 'forward', 'forward', 'right', 'forward', 'forward'],
            minCommands: 6
        },
        {
            id: 4,
            mission: "Level 4: Jalur Bentuk L",
            hint: "Kombinasikan maju dan belok untuk membentuk huruf L.",
            concept: "Turns - Pola L",
            grid: [
                [0, 0, 0, 0, 0],
                ['S', 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 'G', 0, 0]
            ],
            startDirection: 'down',
            solution: ['forward', 'forward', 'forward', 'left', 'forward', 'forward'],
            minCommands: 6
        },

        // ===== MEDIUM: Obstacles =====
        {
            id: 5,
            mission: "Level 5: Hindari Rintangan!",
            hint: "Ada tembok! Cari jalan memutar untuk mencapai tujuan.",
            concept: "Problem Solving - Menghindari Rintangan",
            grid: [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                ['S', 'X', 0, 'G', 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ],
            startDirection: 'right',
            solution: ['left', 'forward', 'right', 'forward', 'forward', 'forward', 'right', 'forward'],
            minCommands: 8
        },
        {
            id: 6,
            mission: "Level 6: Labirin Mini",
            hint: "Navigasi melalui labirin dengan hati-hati!",
            concept: "Maze Navigation",
            grid: [
                [0, 0, 0, 0, 0],
                [0, 'X', 'X', 0, 0],
                ['S', 'X', 0, 0, 0],
                [0, 0, 0, 'X', 0],
                [0, 0, 0, 0, 'G']
            ],
            startDirection: 'down',
            solution: ['forward', 'forward', 'left', 'forward', 'forward', 'left', 'forward', 'left', 'forward'],
            minCommands: 9
        },

        // ===== INTERMEDIATE: Introducing Loops =====
        {
            id: 7,
            mission: "Level 7: Kekuatan Loop!",
            hint: "Gunakan LOOP untuk mengulang perintah 2x. Lebih efisien!",
            concept: "Loop - Pengulangan",
            grid: [
                ['S', 0, 0, 0, 'G'],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ],
            startDirection: 'right',
            solution: ['loop', 'forward', 'forward'],
            minCommands: 3
        },
        {
            id: 8,
            mission: "Level 8: Loop + Belok",
            hint: "Kombinasikan loop dengan perintah belok!",
            concept: "Loop dengan Turn",
            grid: [
                ['S', 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                ['G', 0, 0, 0, 0]
            ],
            startDirection: 'down',
            solution: ['loop', 'forward', 'forward'],
            minCommands: 3
        },

        // ===== ADVANCED: Complex Challenges =====
        {
            id: 9,
            mission: "Level 9: Labirin Besar Maze",
            hint: "Labirin kompleks! Rencanakan rute dengan cermat.",
            concept: "Complex Problem Solving",
            grid: [
                ['S', 0, 'X', 0, 0],
                ['X', 0, 'X', 0, 0],
                [0, 0, 0, 0, 'X'],
                [0, 'X', 'X', 0, 0],
                [0, 0, 0, 0, 'G']
            ],
            startDirection: 'right',
            solution: ['forward', 'right', 'forward', 'forward', 'left', 'forward', 'forward', 'left', 'forward', 'forward', 'right', 'forward', 'forward'],
            minCommands: 13
        },
        {
            id: 10,
            mission: "Level 10: Master Challenge!",
            hint: "Level terakhir! Gunakan semua yang kamu pelajari!",
            concept: "Mastery - Semua Konsep",
            grid: [
                ['S', 0, 0, 'X', 'G'],
                [0, 'X', 0, 'X', 0],
                [0, 'X', 0, 0, 0],
                [0, 0, 0, 'X', 0],
                [0, 'X', 0, 0, 0]
            ],
            startDirection: 'right',
            solution: ['forward', 'forward', 'right', 'forward', 'forward', 'left', 'forward', 'left', 'forward', 'forward', 'forward', 'left', 'forward'],
            minCommands: 13
        },

        // ===== GRADE 12: Advanced Computational Thinking =====
        {
            id: 11,
            mission: "Level 11: Nested Loop Pattern",
            hint: "Gunakan loop di dalam loop! Pattern: (maju-maju-belok) x 2",
            concept: "Nested Loops - Loop Bersarang",
            grid: [
                ['S', 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 'G']
            ],
            startDirection: 'right',
            solution: ['loop', 'loop', 'forward', 'forward', 'right'],
            minCommands: 5
        },
        {
            id: 12,
            mission: "Level 12: Zigzag Algorithm Simulasi",
            hint: "Buat pola zigzag yang efisien dengan loop!",
            concept: "Algorithm Design",
            grid: [
                ['S', 0, 0, 0, 0],
                ['X', 'X', 'X', 'X', 0],
                [0, 0, 0, 0, 0],
                [0, 'X', 'X', 'X', 'X'],
                ['G', 0, 0, 0, 0]
            ],
            startDirection: 'right',
            solution: ['loop', 'forward', 'forward', 'right', 'forward', 'right', 'loop', 'forward', 'forward', 'left', 'forward', 'left', 'loop', 'forward', 'forward'],
            minCommands: 15
        },
        {
            id: 13,
            mission: "Level 13: Function Thinking Fungsi",
            hint: "Bayangkan pattern sebagai fungsi yang bisa dipanggil berulang!",
            concept: "Procedural Thinking",
            grid: [
                ['S', 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 'X', 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 'G']
            ],
            startDirection: 'down',
            solution: ['forward', 'forward', 'left', 'forward', 'forward', 'right', 'forward', 'forward', 'right', 'forward', 'forward'],
            minCommands: 11
        },
        {
            id: 14,
            mission: "Level 14: Optimization Challenge Target",
            hint: "Temukan rute TERPENDEK! Minimal commands = bonus bintang!",
            concept: "Algorithm Optimization",
            grid: [
                ['S', 0, 0, 0, 0],
                [0, 'X', 0, 'X', 0],
                [0, 'X', 0, 'X', 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 'G']
            ],
            startDirection: 'down',
            solution: ['forward', 'forward', 'forward', 'left', 'forward', 'forward', 'left', 'forward', 'right', 'forward', 'forward'],
            minCommands: 11
        },
        {
            id: 15,
            mission: "Level 15: Ultimate Maze Master!",
            hint: "Level ultimate! Kombinasikan semua teknik: sequence, loop, planning!",
            concept: "Mastery - Computational Thinking",
            grid: [
                ['S', 0, 'X', 0, 0, 0],
                ['X', 0, 'X', 0, 'X', 0],
                [0, 0, 0, 0, 'X', 0],
                [0, 'X', 'X', 0, 0, 0],
                [0, 'X', 0, 0, 'X', 0],
                [0, 0, 0, 'X', 0, 'G']
            ],
            startDirection: 'right',
            solution: ['forward', 'right', 'forward', 'left', 'forward', 'forward', 'left', 'forward', 'forward', 'forward', 'right', 'forward', 'forward', 'left', 'forward', 'forward', 'right', 'forward', 'forward'],
            minCommands: 19
        },

        // ===== DUAL ROBOT CHALLENGES =====
        {
            id: 16,
            mission: "Level 16: Dual Robot Sync!",
            hint: "Dua robot harus sampai ke tujuan masing-masing dengan perintah yang SAMA!",
            concept: "Parallel Thinking",
            dualMode: 'parallel',
            grid: [
                ['S', 0, 0, 0, 'G'],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                ['R', 0, 0, 0, 'F']
            ],
            startDirection: 'right',
            startDirection2: 'right',
            solution: ['forward', 'forward', 'forward', 'forward'],
            minCommands: 4
        },
        {
            id: 17,
            mission: "Level 17: Mirror Mind!",
            hint: "Robot merah bergerak TERBALIK! Kiri jadi Kanan, Atas jadi Bawah. Pikirkan dua perspektif!",
            concept: "Mirror Logic - Berpikir Terbalik",
            dualMode: 'mirror',
            grid: [
                [0, 0, 0, 0, 0],
                ['S', 0, 0, 0, 'G'],
                [0, 0, 0, 0, 0],
                ['R', 0, 0, 0, 'F'],
                [0, 0, 0, 0, 0]
            ],
            startDirection: 'right',
            startDirection2: 'left',
            solution: ['forward', 'forward', 'forward', 'forward'],
            minCommands: 4
        },
        {
            id: 18,
            mission: "Level 18: Dual Obstacle Run! Dual Obstacle",
            hint: "Dua robot, satu perintah, beda rintangan! Cari jalur yang aman untuk keduanya.",
            concept: "Parallel Problem Solving",
            dualMode: 'parallel',
            grid: [
                ['S', 0, 0, 'G', 0],
                [0, 0, 'X', 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 'X', 0, 0],
                ['R', 0, 0, 'F', 0]
            ],
            startDirection: 'right',
            startDirection2: 'right',
            solution: ['forward', 'right', 'forward', 'left', 'forward', 'forward'],
            minCommands: 6
        },
        {
            id: 19,
            mission: "Level 19: Mirror Maze!",
            hint: "Robot mirror di labirin! Saat kamu belok kiri, mirror belok kanan. Rencanakan dengan cermat!",
            concept: "Advanced Mirror Logic",
            dualMode: 'mirror',
            grid: [
                [0, 'S', 0, 0, 0],
                [0, 0, 0, 'X', 0],
                [0, 'X', 0, 0, 'G'],
                [0, 0, 0, 'X', 0],
                ['F', 0, 0, 0, 'R']
            ],
            startDirection: 'down',
            startDirection2: 'up',
            solution: ['forward', 'left', 'forward', 'forward', 'left', 'forward', 'forward'],
            minCommands: 7
        },
        {
            id: 20,
            mission: "Level 20: Ultimate Dual Master!",
            hint: "Level ultimate! Dua robot dengan rintangan berbeda. Pikirkan jalur yang bisa dilalui KEDUANYA!",
            concept: "Mastery - Dual Computational Thinking",
            dualMode: 'parallel',
            grid: [
                ['S', 0, 'X', 0, 'G'],
                [0, 0, 0, 0, 0],
                [0, 'X', 0, 'X', 0],
                [0, 0, 0, 0, 0],
                ['R', 0, 'X', 0, 'F']
            ],
            startDirection: 'right',
            startDirection2: 'right',
            solution: ['forward', 'right', 'forward', 'forward', 'left', 'forward', 'forward', 'left', 'forward', 'forward', 'right', 'forward'],
            minCommands: 12
        }
    ];

    // ============================================
    // DIFFICULTY & TUTORIAL CONFIG (Level Design)
    // Pacing: Tutorial → Beginner → Intermediate → Advanced → Expert → Master → Dual
    // ============================================

    const difficultyConfig = {
        // Phase 1: Tutorial - Sangat dermawan, ada panduan langkah
        1: { maxCommands: 8, phase: 'Tutorial', tutorial: [
            { icon: 'Halo', msg: 'Selamat datang di Robot Logic! Tujuanmu: bawa robot Robot ke bendera Tujuan.' },
            { icon: 'Maju', msg: 'Seret blok Maju MAJU ke area "Urutan Perintah" untuk menggerakkan robot ke arah yang dihadapinya.' },
            { icon: 'Jalankan', msg: 'Klik Jalankan jika sudah siap! Klik blok di urutan untuk menghapusnya.' }
        ]},
        2: { maxCommands: 8, phase: 'Tutorial', tutorial: [
            { icon: 'Jarak', msg: 'Robot butuh lebih banyak langkah kali ini.' },
            { icon: 'Hint', msg: 'Hitung jarak dari robot ke bendera, lalu tambahkan blok MAJU yang cukup.' }
        ]},
        3: { maxCommands: 10, phase: 'Tutorial', tutorial: [
            { icon: 'Kiri', msg: 'Bendera ada di arah berbeda! Kamu perlu berbelok.' },
            { icon: 'Loop', msg: 'Blok KIRI / KANAN memutar arah hadap robot, BUKAN memindahkannya.' },
            { icon: 'Hint', msg: 'Setelah belok, gunakan MAJU untuk berjalan ke arah baru.' }
        ]},
        // Phase 2: Beginner - Batas cukup longgar
        4: { maxCommands: 9, phase: 'Beginner' },
        5: { maxCommands: 12, phase: 'Beginner' },
        6: { maxCommands: 13, phase: 'Intermediate' },
        // Phase 3: Loop Introduction - Harus efisien
        7: { maxCommands: 5, phase: 'Loop', tutorial: [
            { icon: 'Loop', msg: 'Blok baru: LOOP! Mengulang 2 perintah setelahnya sebanyak 2 kali (jadi total 4 aksi).' },
            { icon: 'Simulasi', msg: 'Contoh: LOOP → MAJU → MAJU = robot maju 4 langkah!' },
            { icon: 'Efisien', msg: 'Perhatikan batas perintah di kanan atas! Loop membantu kamu hemat perintah.' }
        ]},
        8: { maxCommands: 5, phase: 'Loop' },
        // Phase 4: Advanced - Batas mulai ketat
        9: { maxCommands: 16, phase: 'Advanced' },
        10: { maxCommands: 15, phase: 'Advanced' },
        // Phase 5: Expert - Batas sangat ketat, butuh loop
        11: { maxCommands: 6, phase: 'Expert' },
        12: { maxCommands: 17, phase: 'Expert' },
        13: { maxCommands: 13, phase: 'Expert' },
        14: { maxCommands: 12, phase: 'Expert' },
        // Phase 6: Master - Batas presisi
        15: { maxCommands: 21, phase: 'Master' },
        // Phase 7: Dual Robot
        16: { maxCommands: 6, phase: 'Dual', tutorial: [
            { icon: 'Dual Robot', msg: 'Mode Dual Robot! Dua robot bergerak BERSAMAAN dengan perintah yang sama.' },
            { icon: 'Tujuan', msg: 'Robot Biru menuju Tujuan dan Robot Merah menuju Goal.' },
            { icon: 'Hint', msg: 'Pikirkan jalur yang bisa dilalui KEDUA robot sekaligus!' }
        ]},
        17: { maxCommands: 6, phase: 'Dual Mirror', tutorial: [
            { icon: 'Mirror', msg: 'Mode Mirror! Robot Merah bergerak TERBALIK dari Robot Biru.' },
            { icon: 'Kiri', msg: 'Saat Biru belok KIRI, Merah belok KANAN. Pikirkan dua perspektif!' }
        ]},
        18: { maxCommands: 8, phase: 'Dual' },
        19: { maxCommands: 9, phase: 'Dual' },
        20: { maxCommands: 14, phase: 'Dual Master' }
    };

    levels.forEach(level => {
        const config = difficultyConfig[level.id];
        if (config) {
            level.maxCommands = config.maxCommands;
            level.phase = config.phase;
            if (config.tutorial) level.tutorial = config.tutorial;
        }
    });

    // ============================================
    // STATE
    // ============================================

    let currentLevel = null;
    let robotPosition = { x: 0, y: 0 };
    let robotDirection = 'right';
    let robot2Position = null;
    let robot2Direction = 'right';
    let commandSequence = [];
    let isRunning = false;
    let tutorialActive = false;
    let tutorialStepIndex = 0;
    let dragDropInitialized = false;
    let crashCount = 0;
    let crashCount2 = 0;

    // ============================================
    // INITIALIZATION
    // ============================================

    function isDualMode() {
        return currentLevel && currentLevel.dualMode;
    }

    function init(levelNum) {
        currentLevel = levels[levelNum - 1] || levels[0];
        commandSequence = [];
        isRunning = false;
        crashCount = 0;
        crashCount2 = 0;
        robot2Position = null;
        robot2Direction = currentLevel.startDirection2 || 'right';

        document.getElementById('robot-level').textContent = levelNum;
        document.getElementById('robot-mission').textContent = currentLevel.mission;

        // Update hint display if exists
        const hintEl = document.getElementById('robot-hint');
        if (hintEl) {
            hintEl.textContent = currentLevel.hint;
        }

        // Update concept badge if exists
        const conceptEl = document.getElementById('robot-concept');
        if (conceptEl) {
            conceptEl.textContent = currentLevel.concept;
        }

        // Update dual mode badge
        const dualBadge = document.getElementById('robot-dual-badge');
        if (dualBadge) {
            if (isDualMode()) {
                dualBadge.classList.remove('hidden');
                if (currentLevel.dualMode === 'mirror') {
                    dualBadge.textContent = 'MIRROR MODE';
                    dualBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-pink-500/30 text-pink-300 border border-pink-500/50';
                } else {
                    dualBadge.textContent = 'DUAL MODE';
                    dualBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-red-500/30 text-red-300 border border-red-500/50';
                }
            } else {
                dualBadge.classList.add('hidden');
            }
        }

        renderGrid();
        renderCommandBlocks();
        clearSequence();
        hideFeedback('robot-feedback');

        setupDragDrop();
        setupControls();

        animateGridEntrance();

        // Update command limit badge
        const cmdLimitEl = document.getElementById('robot-cmd-limit');
        if (cmdLimitEl) {
            if (currentLevel.maxCommands) {
                cmdLimitEl.classList.remove('hidden');
                cmdLimitEl.textContent = `Maks: ${currentLevel.maxCommands} perintah`;
            } else {
                cmdLimitEl.classList.add('hidden');
            }
        }

        // Update phase badge
        const phaseEl = document.getElementById('robot-phase');
        if (phaseEl && currentLevel.phase) {
            phaseEl.textContent = currentLevel.phase;
            phaseEl.classList.remove('hidden');
        } else if (phaseEl) {
            phaseEl.classList.add('hidden');
        }

        // Update command count display
        updateCommandCount();

        // Show tutorial if available
        if (currentLevel.tutorial && currentLevel.tutorial.length > 0) {
            setTimeout(() => showTutorial(), 600);
        }
    }

    // ============================================
    // ANIMATIONS
    // ============================================

    function animateGridEntrance() {
        anime({
            targets: '.robot-grid-cell',
            scale: [0, 1],
            opacity: [0, 1],
            delay: anime.stagger(30, { grid: [5, 5], from: 'center' }),
            duration: 400,
            easing: 'easeOutBack'
        });

        anime({
            targets: '.command-block',
            translateX: [-30, 0],
            opacity: [0, 1],
            delay: anime.stagger(50, { start: 200 }),
            duration: 400,
            easing: 'easeOutQuart'
        });
    }

    function animateRobotMove(cell) {
        anime({
            targets: cell,
            scale: [1, 1.2, 1],
            duration: 300,
            easing: 'easeOutElastic(1, .8)'
        });
    }

    function animateSuccess() {
        anime({
            targets: '.robot-grid-cell.robot, .robot-grid-cell.robot2',
            scale: [1, 1.4, 1],
            rotate: [0, 360],
            duration: 800,
            easing: 'easeOutElastic(1, .5)'
        });

        anime({
            targets: '.robot-grid-cell.goal, .robot-grid-cell.goal2',
            backgroundColor: ['rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.8)', 'rgba(34, 197, 94, 0.3)'],
            duration: 500,
            loop: 3,
            easing: 'easeInOutSine'
        });
    }

    function animateFailure() {
        anime({
            targets: '#robot-grid',
            translateX: [-10, 10, -10, 10, 0],
            duration: 400,
            easing: 'easeInOutSine'
        });
    }

    // ============================================
    // GRID RENDERING
    // ============================================

    function gridIconSvg(type) {
        if (type === 'goal') {
            return '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4v16"/><path d="M6 5h11l-2.5 3 2.5 3H6"/></svg>';
        }
        if (type === 'goal2') {
            return '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 4v16"/><path d="M18 5H7l2.5 3L7 11h11"/></svg>';
        }
        return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="m4 4 16 16M20 4 4 20"/></svg>';
    }

    function renderGrid() {
        const gridContainer = document.getElementById('robot-grid');
        gridContainer.innerHTML = '';

        const rows = currentLevel.grid.length;
        const cols = currentLevel.grid[0].length;
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cell = document.createElement('div');
                cell.className = 'robot-grid-cell w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold';
                cell.dataset.x = x;
                cell.dataset.y = y;

                const value = currentLevel.grid[y][x];

                if (value === 'S') {
                    cell.classList.add('robot');
                    cell.innerHTML = getRobotEmoji(currentLevel.startDirection, false, 'blue');
                    robotPosition = { x, y };
                    robotDirection = currentLevel.startDirection;
                } else if (value === 'R') {
                    // Robot 2 (merah) start
                    cell.classList.add('robot2');
                    cell.innerHTML = getRobotEmoji(currentLevel.startDirection2 || 'right', false, 'red');
                    robot2Position = { x, y };
                    robot2Direction = currentLevel.startDirection2 || 'right';
                } else if (value === 'G') {
                    cell.classList.add('goal');
                    cell.innerHTML = gridIconSvg('goal');
                } else if (value === 'F') {
                    // Robot 2 (merah) goal
                    cell.classList.add('goal2');
                    cell.innerHTML = gridIconSvg('goal2');
                } else if (value === 'X') {
                    cell.classList.add('obstacle');
                    cell.innerHTML = gridIconSvg('obstacle');
                }

                gridContainer.appendChild(cell);
            }
        }
    }

    function getRobotEmoji(direction, moving = false, color = 'blue') {
        const glowColors = {
            'blue': 'rgba(14, 165, 233, 0.6)',
            'red': 'rgba(239, 68, 68, 0.6)',
            'green': 'rgba(34, 197, 94, 0.6)',
            'yellow': 'rgba(234, 179, 8, 0.6)'
        };
        const glow = glowColors[color] || glowColors['blue'];

        if (moving) {
            // Top view saat robot bergerak
            const rotations = {
                'up': 'rotate(-90deg)',
                'down': 'rotate(90deg)',
                'left': 'rotate(180deg)',
                'right': 'rotate(0deg)'
            };
            const transform = rotations[direction] || 'rotate(0deg)';
            return `<img src="assets/PNG robot/Top view/robot_${color}.png" alt="Robot" loading="lazy" decoding="async" style="width: 2.5rem; height: 2.5rem; object-fit: contain; transform: ${transform}; transition: transform 0.3s ease; filter: drop-shadow(0 0 6px ${glow});">`;
        } else {
            // Side view saat robot diam
            const rotations = {
                'up': 'rotate(-90deg)',
                'down': 'rotate(90deg)',
                'left': 'scaleX(-1)',
                'right': 'rotate(0deg)'
            };
            const transform = rotations[direction] || 'rotate(0deg)';
            return `<img src="assets/PNG robot/Side view/robot_${color}Body.png" alt="Robot" loading="lazy" decoding="async" style="width: 2.5rem; height: 2.5rem; object-fit: contain; transform: ${transform}; transition: transform 0.3s ease;">`;
        }
    }

    function updateRobotCell() {
        // Clear robot 1
        document.querySelectorAll('.robot-grid-cell.robot').forEach(cell => {
            cell.classList.remove('robot');
            cell.innerHTML = '';
            const cellX = parseInt(cell.dataset.x);
            const cellY = parseInt(cell.dataset.y);
            const val = currentLevel.grid[cellY][cellX];
            if (val === 'G') { cell.classList.add('goal'); cell.innerHTML = gridIconSvg('goal'); }
            if (val === 'F') { cell.classList.add('goal2'); cell.innerHTML = gridIconSvg('goal2'); }
        });

        // Clear robot 2
        document.querySelectorAll('.robot-grid-cell.robot2').forEach(cell => {
            cell.classList.remove('robot2');
            cell.innerHTML = '';
            const cellX = parseInt(cell.dataset.x);
            const cellY = parseInt(cell.dataset.y);
            const val = currentLevel.grid[cellY][cellX];
            if (val === 'G') { cell.classList.add('goal'); cell.innerHTML = gridIconSvg('goal'); }
            if (val === 'F') { cell.classList.add('goal2'); cell.innerHTML = gridIconSvg('goal2'); }
        });

        // Place robot 1 (blue)
        const newCell = document.querySelector(
            `.robot-grid-cell[data-x="${robotPosition.x}"][data-y="${robotPosition.y}"]`
        );
        if (newCell) {
            newCell.classList.add('robot');
            newCell.innerHTML = getRobotEmoji(robotDirection, isRunning, 'blue');
            animateRobotMove(newCell);
        }

        // Place robot 2 (red) if dual mode
        if (isDualMode() && robot2Position) {
            const newCell2 = document.querySelector(
                `.robot-grid-cell[data-x="${robot2Position.x}"][data-y="${robot2Position.y}"]`
            );
            if (newCell2) {
                newCell2.classList.add('robot2');
                newCell2.innerHTML = getRobotEmoji(robot2Direction, isRunning, 'red');
                animateRobotMove(newCell2);
            }
        }
    }

    // ============================================
    // COMMAND BLOCKS
    // ============================================

    function commandIconSvg(command) {
        const icons = {
            forward: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m0-14-4 4m4-4 4 4"/></svg>',
            left: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 6 8 12l6 6"/></svg>',
            right: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="m10 6 6 6-6 6"/></svg>',
            loop: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6"/></svg>'
        };
        return icons[command] || icons.forward;
    }

    function renderCommandBlocks() {
        const container = document.getElementById('command-blocks');
        container.innerHTML = '';

        const commands = [
            { id: 'forward', label: 'Maju', color: 'primary' },
            { id: 'left', label: 'Kiri', color: 'accent' },
            { id: 'right', label: 'Kanan', color: 'accent' },
            { id: 'loop', label: 'Loop (2x)', color: 'purple' }
        ];

        commands.forEach(cmd => {
            const block = document.createElement('div');
            block.className = `command-block ${cmd.id === 'loop' ? 'loop' : ''} text-white font-semibold text-sm cursor-pointer`;
            block.draggable = true;
            block.dataset.command = cmd.id;
            block.innerHTML = `${commandIconSvg(cmd.id)} <span>${cmd.label}</span>`;
            // Click to add (mobile-friendly)
            block.addEventListener('click', () => {
                if (!isRunning) addToSequence(cmd.id);
            });
            container.appendChild(block);
        });
    }

    function clearSequence() {
        commandSequence = [];
        const sequenceArea = document.getElementById('sequence-area');
        sequenceArea.innerHTML = '<span class="text-dark-200 text-sm w-full text-center py-8">Seret blok perintah ke sini</span>';
        updateCommandCount();
        updateLoopPreview();
        hideFeedback('robot-feedback');
    }

    function addToSequence(command) {
        if (currentLevel.maxCommands && commandSequence.length >= currentLevel.maxCommands) {
            showFeedback('robot-feedback', `Peringatan Batas ${currentLevel.maxCommands} perintah tercapai! Hapus perintah atau gunakan Loop.`, false);
            if (typeof SoundManager !== 'undefined') SoundManager.play('warning');
            anime({
                targets: '#command-count',
                scale: [1, 1.4, 1],
                duration: 400,
                easing: 'easeInOutSine'
            });
            return;
        }
        commandSequence.push(command);
        if (typeof SoundManager !== 'undefined') SoundManager.play('drop');
        renderSequence();
    }

    function renderSequence() {
        const sequenceArea = document.getElementById('sequence-area');
        sequenceArea.innerHTML = '';

        if (commandSequence.length === 0) {
            sequenceArea.innerHTML = '<span class="text-dark-200 text-sm w-full text-center py-8">Seret blok perintah ke sini</span>';
            return;
        }

        commandSequence.forEach((cmd, index) => {
            const block = document.createElement('div');
            const isLoop = cmd === 'loop';
            block.className = `command-block ${isLoop ? 'loop' : ''} text-white font-semibold text-sm cursor-pointer`;
            block.innerHTML = getCommandDisplay(cmd);
            block.addEventListener('click', () => {
                if (!isRunning) {
                    removeFromSequence(index);
                }
            });
            sequenceArea.appendChild(block);

            anime({
                targets: block,
                scale: [0, 1],
                duration: 200,
                easing: 'easeOutBack'
            });
        });

        // Show command count
        updateCommandCount();
        updateLoopPreview();
    }

    function updateCommandCount() {
        const countEl = document.getElementById('command-count');
        if (!countEl) return;

        const max = currentLevel.maxCommands;
        const count = commandSequence.length;

        if (max) {
            countEl.textContent = `${count}/${max}`;
            if (count >= max) {
                countEl.className = 'text-sm font-bold text-red-400 animate-pulse';
            } else if (count >= max - 2) {
                countEl.className = 'text-sm font-bold text-amber-400';
            } else if (currentLevel.minCommands && count <= currentLevel.minCommands && count > 0) {
                countEl.className = 'text-sm font-bold text-emerald-400';
            } else {
                countEl.className = 'text-sm font-bold text-dark-200';
            }
        } else {
            countEl.textContent = `${count}`;
            countEl.className = 'text-sm font-bold text-dark-200';
        }
    }

    function getCommandDisplay(cmd) {
        const displays = {
            'forward': `${commandIconSvg('forward')} <span>Maju</span>`,
            'left': `${commandIconSvg('left')} <span>Kiri</span>`,
            'right': `${commandIconSvg('right')} <span>Kanan</span>`,
            'loop': `${commandIconSvg('loop')} <span>Loop (2x)</span>`
        };
        return displays[cmd] || cmd;
    }

    function updateLoopPreview() {
        const previewEl = document.getElementById('loop-preview');
        if (!previewEl) return;
        if (commandSequence.length === 0) {
            previewEl.textContent = '';
            return;
        }

        const expand = typeof RobotSequenceRules !== 'undefined'
            ? RobotSequenceRules.expandRobotSequence(commandSequence)
            : { ok: true, expanded: [...commandSequence] };

        if (!expand.ok) {
            previewEl.textContent = `Peringatan ${expand.error}`;
            previewEl.className = 'text-xs text-red-300 mb-2 min-h-[1rem]';
            return;
        }

        previewEl.textContent = `Preview eksekusi: ${expand.expanded.length} langkah`;
        previewEl.className = 'text-xs text-dark-300 mb-2 min-h-[1rem]';
    }

    function removeFromSequence(index) {
        commandSequence.splice(index, 1);
        renderSequence();
    }

    // ============================================
    // DRAG & DROP
    // ============================================

    function setupDragDrop() {
        if (dragDropInitialized) return;
        dragDropInitialized = true;

        const blocksContainer = document.getElementById('command-blocks');
        const sequenceArea = document.getElementById('sequence-area');

        blocksContainer.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('command-block')) {
                e.dataTransfer.setData('text/plain', e.target.dataset.command);
                e.target.classList.add('dragging');
            }
        });

        blocksContainer.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('command-block')) {
                e.target.classList.remove('dragging');
            }
        });

        sequenceArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            sequenceArea.classList.add('drag-over');
        });

        sequenceArea.addEventListener('dragleave', () => {
            sequenceArea.classList.remove('drag-over');
        });

        sequenceArea.addEventListener('drop', (e) => {
            e.preventDefault();
            sequenceArea.classList.remove('drag-over');
            const command = e.dataTransfer.getData('text/plain');
            if (command) {
                addToSequence(command);
            }
        });
    }

    // ============================================
    // CONTROLS
    // ============================================

    function setupControls() {
        const btnClear = document.getElementById('btn-clear-robot');
        const btnRun = document.getElementById('btn-run-robot');

        [btnClear, btnRun].forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        document.getElementById('btn-clear-robot').addEventListener('click', () => {
            if (!isRunning) {
                clearSequence();
                crashCount = 0;
                crashCount2 = 0;
                renderGrid();
                hideFeedback('robot-feedback');
            }
        });

        document.getElementById('btn-run-robot').addEventListener('click', runSequence);
    }

    // ============================================
    // EXECUTION
    // ============================================

    async function runSequence() {
        if (isRunning || commandSequence.length === 0) return;
        isRunning = true;
        lastCrashReason = null;

        const rows = currentLevel.grid.length;
        const cols = currentLevel.grid[0].length;

        // Reset robot 1 position
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (currentLevel.grid[y][x] === 'S') {
                    robotPosition = { x, y };
                    robotDirection = currentLevel.startDirection;
                }
                if (currentLevel.grid[y][x] === 'R') {
                    robot2Position = { x, y };
                    robot2Direction = currentLevel.startDirection2 || 'right';
                }
            }
        }
        updateRobotCell();

        // Expand loops with validation
        const expandedResult = typeof RobotSequenceRules !== 'undefined'
            ? RobotSequenceRules.expandRobotSequence(commandSequence)
            : { ok: true, expanded: [...commandSequence] };
        if (!expandedResult.ok) {
            showFeedback('robot-feedback', `Peringatan ${expandedResult.error}`, false);
            if (typeof SoundManager !== 'undefined') SoundManager.play('warning');
            isRunning = false;
            return;
        }
        const expandedCommands = expandedResult.expanded;

        // Execute commands
        for (let idx = 0; idx < expandedCommands.length; idx++) {
            const cmd = expandedCommands[idx];
            const success = await executeCommand(cmd);
            if (!success) {
                const whoFailed = lastCrashRobot === 2 ? 'Robot Merah' : 'Robot Biru';
                const relevantCrash = lastCrashRobot === 2 ? crashCount2 : crashCount;
                const damageMsg = typeof ModeFeedbackRules !== 'undefined'
                    ? ModeFeedbackRules.getRobotFailureMessage({
                        robotName: whoFailed,
                        crashCount: relevantCrash,
                        reason: lastCrashReason,
                        stepIndex: idx,
                        totalSteps: expandedCommands.length
                    })
                    : (relevantCrash === 1
                        ? `Gagal ${whoFailed} rusak ringan! (Damage 1) Coba lagi!`
                        : `Gagal berat ${whoFailed} rusak parah! (Damage 2) Coba lagi!`);
                showFeedback('robot-feedback', damageMsg, false);
                if (typeof SoundManager !== 'undefined') SoundManager.play('error');
                animateFailure();
                isRunning = false;
                return;
            }
            await delay(400);
        }

        // Check win condition
        const goal1Reached = currentLevel.grid[robotPosition.y][robotPosition.x] === 'G';
        let goal2Reached = true;

        if (isDualMode() && robot2Position) {
            goal2Reached = currentLevel.grid[robot2Position.y][robot2Position.x] === 'F';
        }

        isRunning = false;
        updateRobotCell();

        if (goal1Reached && goal2Reached) {
            const efficiency = commandSequence.length <= currentLevel.minCommands ? 'Bintang Efisien!' : '';
            const dualBonus = isDualMode() ? ' Dual robot berhasil sync! Sinkron' : '';
            showFeedback('robot-feedback', `Sukses Berhasil! ${efficiency}${dualBonus}`, true);
            if (typeof SoundManager !== 'undefined') SoundManager.play('success');
            animateSuccess();
            await delay(800);
            const totalErrors = crashCount + crashCount2;
            completeLevel('robot', {
                timeTaken: typeof ProgressSystem !== 'undefined' ? ProgressSystem.getLevelTime() : 0,
                commandsUsed: commandSequence.length,
                minCommands: currentLevel.minCommands || 0,
                hintsUsed: 0,
                errorsOccurred: totalErrors
            });
        } else if (!goal1Reached && !goal2Reached) {
            showFeedback('robot-feedback', 'Kedua robot belum sampai ke tujuan!', false);
        } else if (!goal1Reached) {
            showFeedback('robot-feedback', 'Robot Biru belum sampai ke bendera!', false);
        } else {
            showFeedback('robot-feedback', 'Robot Merah belum sampai ke tujuan!', false);
        }
    }

    let lastCrashRobot = 0;
    let lastCrashReason = null;

    async function executeCommand(cmd) {
        if (cmd === 'forward') {
            if (typeof SoundManager !== 'undefined') SoundManager.play('robotStep');
            // Move robot 1
            const success1 = moveRobot(robotPosition, robotDirection, 'blue');
            if (!success1) { lastCrashRobot = 1; return false; }

            // Move robot 2 if dual mode
            if (isDualMode() && robot2Position) {
                let cmd2 = 'forward';
                if (currentLevel.dualMode === 'mirror') {
                    cmd2 = 'forward'; // forward stays forward in mirror
                }
                const success2 = moveRobot(robot2Position, robot2Direction, 'red');
                if (!success2) { lastCrashRobot = 2; return false; }
            }

            updateRobotCell();
            return true;
        } else if (cmd === 'left') {
            if (typeof SoundManager !== 'undefined') SoundManager.play('robotTurn');
            turnRobot('left', 'blue');
            if (isDualMode() && robot2Position) {
                if (currentLevel.dualMode === 'mirror') {
                    turnRobot('right', 'red'); // Mirror: left becomes right
                } else {
                    turnRobot('left', 'red');
                }
            }
            updateRobotCell();
            return true;
        } else if (cmd === 'right') {
            if (typeof SoundManager !== 'undefined') SoundManager.play('robotTurn');
            turnRobot('right', 'blue');
            if (isDualMode() && robot2Position) {
                if (currentLevel.dualMode === 'mirror') {
                    turnRobot('left', 'red'); // Mirror: right becomes left
                } else {
                    turnRobot('right', 'red');
                }
            }
            updateRobotCell();
            return true;
        }
        return true;
    }

    function turnRobot(dir, color) {
        const turnsLeft = { 'up': 'left', 'left': 'down', 'down': 'right', 'right': 'up' };
        const turnsRight = { 'up': 'right', 'right': 'down', 'down': 'left', 'left': 'up' };
        const turns = dir === 'left' ? turnsLeft : turnsRight;

        if (color === 'blue') {
            robotDirection = turns[robotDirection];
        } else {
            robot2Direction = turns[robot2Direction];
        }
    }

    function getDamageImage(color = 'blue') {
        const count = color === 'blue' ? crashCount : crashCount2;
        if (count <= 1) {
            return `assets/PNG robot/Side view/robot_${color}Damage1.png`;
        } else {
            return `assets/PNG robot/Side view/robot_${color}Damage2.png`;
        }
    }

    function showDamageRobot(color = 'blue') {
        const pos = color === 'blue' ? robotPosition : robot2Position;
        const cell = document.querySelector(
            `.robot-grid-cell[data-x="${pos.x}"][data-y="${pos.y}"]`
        );
        if (cell) {
            const img = getDamageImage(color);
            cell.innerHTML = `<img src="${img}" alt="Robot Damaged" loading="lazy" decoding="async" style="width: 2.5rem; height: 2.5rem; object-fit: contain; filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.7));">`;
        }
    }

    function moveRobot(position, direction, color) {
        let newX = position.x;
        let newY = position.y;

        const rows = currentLevel.grid.length;
        const cols = currentLevel.grid[0].length;

        switch (direction) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }

        if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) {
            if (color === 'blue') { crashCount++; } else { crashCount2++; }
            lastCrashReason = 'out';
            showDamageRobot(color);
            return false;
        }

        if (currentLevel.grid[newY][newX] === 'X') {
            if (color === 'blue') { crashCount++; } else { crashCount2++; }
            lastCrashReason = 'wall';
            showDamageRobot(color);
            return false;
        }

        position.x = newX;
        position.y = newY;
        return true;
    }

    function turnLeft() {
        const turns = { 'up': 'left', 'left': 'down', 'down': 'right', 'right': 'up' };
        robotDirection = turns[robotDirection];
    }

    function turnRight() {
        const turns = { 'up': 'right', 'right': 'down', 'down': 'left', 'left': 'up' };
        robotDirection = turns[robotDirection];
    }

    // ============================================
    // TUTORIAL SYSTEM
    // ============================================

    function tutorialIconSvg(iconKey) {
        const map = {
            Halo: '<svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 10h.01M15 10h.01"/></svg>',
            Maju: commandIconSvg('forward'),
            Kiri: commandIconSvg('left'),
            Jalankan: '<svg viewBox="0 0 24 24" width="54" height="54" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
            Jarak: '<svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16"/><path d="m8 8-4 4 4 4m8-8 4 4-4 4"/></svg>',
            Hint: '<svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a7 7 0 0 0-4 12.8V19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3.2A7 7 0 0 0 12 3Z"/><path d="M10 19h4"/></svg>',
            Loop: commandIconSvg('loop'),
            Simulasi: '<svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h7l-2 8 9-12h-7l2-4"/></svg>',
            Efisien: '<svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
            'Dual Robot': '<svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="7" height="6" rx="1.5"/><rect x="14" y="8" width="7" height="6" rx="1.5"/><path d="M6.5 5v3M17.5 5v3"/></svg>',
            Tujuan: gridIconSvg('goal'),
            Mirror: '<svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18"/><rect x="4" y="5" width="6" height="14" rx="1.5"/><rect x="14" y="5" width="6" height="14" rx="1.5"/></svg>'
        };
        return map[iconKey] || '<svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>';
    }

    function showTutorial() {
        if (!currentLevel.tutorial || currentLevel.tutorial.length === 0) return;
        tutorialActive = true;
        tutorialStepIndex = 0;

        const overlay = document.getElementById('robot-tutorial-overlay');
        if (!overlay) return;

        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        overlay.style.opacity = '1';
        renderTutorialStep();

        document.getElementById('tutorial-next-btn').onclick = () => {
            if (typeof SoundManager !== 'undefined') SoundManager.play('click');
            tutorialStepIndex++;
            if (tutorialStepIndex >= currentLevel.tutorial.length) {
                closeTutorial();
            } else {
                renderTutorialStep();
            }
        };
    }

    function renderTutorialStep() {
        const step = currentLevel.tutorial[tutorialStepIndex];
        const icon = document.getElementById('tutorial-icon');
        const msg = document.getElementById('tutorial-message');
        const indicator = document.getElementById('tutorial-step-indicator');
        const btn = document.getElementById('tutorial-next-btn');

        if (icon) icon.innerHTML = tutorialIconSvg(step.icon);
        if (msg) msg.textContent = step.msg;
        if (indicator) indicator.textContent = `${tutorialStepIndex + 1}/${currentLevel.tutorial.length}`;
        if (btn) btn.textContent = tutorialStepIndex === currentLevel.tutorial.length - 1 ? 'Mulai!' : 'Lanjut';

        anime({
            targets: '#tutorial-icon',
            scale: [0.5, 1],
            duration: 300,
            easing: 'easeOutBack'
        });
        anime({
            targets: '#tutorial-message',
            opacity: [0, 1],
            translateY: [10, 0],
            duration: 300,
            easing: 'easeOutQuart'
        });
    }

    function closeTutorial() {
        tutorialActive = false;
        const overlay = document.getElementById('robot-tutorial-overlay');
        anime({
            targets: overlay,
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuart',
            complete: () => {
                overlay.classList.add('hidden');
                overlay.classList.remove('flex');
                overlay.style.opacity = '';
            }
        });
        if (typeof SoundManager !== 'undefined') SoundManager.play('gameStart');
    }

    // ============================================
    // PUBLIC API
    // ============================================

    return {
        init,
        getLevelCount: () => levels.length
    };
})();
