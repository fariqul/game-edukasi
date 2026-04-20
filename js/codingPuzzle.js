/**
 * INFORMATIKA LAB ADVENTURE
 * Mode 4: Coding Puzzle Lab
 * Konsep: Loop, If-Else, Variabel, Output, Debugging
 * 10 Levels with Progressive Difficulty
 */

const CodingGame = (() => {
    // ============================================
    // PUZZLE DATA - 10 LEVELS
    // ============================================

    const puzzles = [
        // ===== BEGINNER: Basic Print & Variables =====
        {
            id: 1,
            type: 'fill',
            typeName: 'Fill the Gap',
            mission: 'Level 1: Hello World! Halo',
            hint: 'Gunakan tanda kutip untuk teks.',
            concept: 'Print Statement',
            code: [
                { text: 'print(', slot: true, answer: '"Hello World"', text2: ')' }
            ],
            blocks: ['"Hello World"', '"Goodbye"', '123'],
            expectedOutput: 'Hello World'
        },
        {
            id: 2,
            type: 'fill',
            typeName: 'Fill the Gap',
            mission: 'Level 2: Buat Variabel! Fungsi',
            hint: 'Variabel menyimpan nilai angka atau teks.',
            concept: 'Variables',
            code: [
                { text: 'angka = ', slot: true, answer: '10' },
                { text: 'print(angka)' }
            ],
            blocks: ['10', '"sepuluh"', 'angka'],
            expectedOutput: '10'
        },
        {
            id: 3,
            type: 'guess',
            typeName: 'Tebak Output',
            mission: 'Level 3: Tebak Hasil! Target',
            hint: 'Operator + menjumlahkan dua angka.',
            concept: 'Arithmetic',
            code: [
                { text: 'x = 5' },
                { text: 'y = 3' },
                { text: 'print(x + y)' }
            ],
            choices: ['8', '53', 'x + y', 'Error'],
            answer: '8',
            expectedOutput: '8'
        },

        // ===== EASY: Conditions & Comparisons =====
        {
            id: 4,
            type: 'fill',
            typeName: 'Fill the Gap',
            mission: 'Level 4: Logika Kondisi! Percabangan',
            hint: 'Operator perbandingan: >= artinya "lebih besar atau sama dengan". Kalau nilai 80 >= 75, hasilnya True!',
            concept: 'If Statement',
            code: [
                { text: 'nilai = 80' },
                { text: 'if nilai ', slot: true, answer: '>= 75', text2: ':' },
                { text: '    print("Lulus")', indent: 1 }
            ],
            blocks: ['>= 75', '== 75', '< 75'],
            expectedOutput: 'Lulus'
        },
        {
            id: 5,
            type: 'sort',
            typeName: 'Susun Urutan',
            mission: 'Level 5: Menghitung Luas! Geometri',
            hint: 'Definisikan variabel sebelum digunakan.',
            concept: 'Sequence',
            correctOrder: [
                'sisi = 5',
                'luas = sisi * sisi',
                'print(luas)'
            ],
            shuffledBlocks: ['print(luas)', 'sisi = 5', 'luas = sisi * sisi'],
            expectedOutput: '25'
        },

        // ===== MEDIUM: Loops =====
        {
            id: 6,
            type: 'fill',
            typeName: 'Fill the Gap',
            mission: 'Level 6: Kekuatan Loop! Loop',
            hint: 'range(start, stop) menghasilkan angka dari start sampai stop-1. Jadi range(1, 4) = [1, 2, 3].',
            concept: 'For Loop',
            code: [
                { text: 'for i in ', slot: true, answer: 'range(1, 4)', text2: ':' },
                { text: '    print(i)', indent: 1 }
            ],
            blocks: ['range(1, 4)', 'range(1, 3)', 'range(3)'],
            expectedOutput: '1\n2\n3'
        },
        {
            id: 7,
            type: 'guess',
            typeName: 'Tebak Output',
            mission: 'Level 7: Hasil Loop! Angka',
            hint: 'Loop menjalankan print() berulang kali.',
            concept: 'Loop Output',
            code: [
                { text: 'total = 0' },
                { text: 'for i in range(3):' },
                { text: '    total = total + 1', indent: 1 },
                { text: 'print(total)' }
            ],
            choices: ['0', '1', '3', '6'],
            answer: '3',
            expectedOutput: '3'
        },

        // ===== INTERMEDIATE: Debugging =====
        {
            id: 8,
            type: 'debug',
            typeName: 'Debug Mode',
            mission: 'Level 8: Temukan Bug! Bug',
            hint: 'Bug hunting! Python case-sensitive: "nama" dan "Nama" adalah variabel BERBEDA. Cek huruf besar/kecilnya!',
            concept: 'Debugging',
            buggyCode: [
                { text: 'nama = "Budi"' },
                { text: 'print(Nama)', hasError: true, correct: 'print(nama)' }
            ],
            blocks: ['print(nama)', 'print(Nama)', 'print("nama")'],
            expectedOutput: 'Budi'
        },
        {
            id: 9,
            type: 'sort',
            typeName: 'Susun Urutan',
            mission: 'Level 9: Program Genap/Ganjil! Logika',
            hint: 'Operator modulo (%) untuk sisa bagi.',
            concept: 'Modulo Operation',
            correctOrder: [
                'angka = 6',
                'if angka % 2 == 0:',
                '    print("Genap")'
            ],
            shuffledBlocks: ['    print("Genap")', 'angka = 6', 'if angka % 2 == 0:'],
            expectedOutput: 'Genap'
        },

        // ===== ADVANCED: Complex Logic =====
        {
            id: 10,
            type: 'fill',
            typeName: 'Fill the Gap',
            mission: 'Level 10: Master Challenge! Prestasi',
            hint: 'Modulo (%) menghitung sisa bagi. Genap: sisa 0 saat dibagi 2. Gunakan i % 2 == 0 untuk mengecek!',
            concept: 'Loop + Condition',
            code: [
                { text: 'for i in range(1, 6):' },
                { text: '    if i ', slot: true, answer: '% 2 == 0', text2: ':' },
                { text: '        print(i)', indent: 2 }
            ],
            blocks: ['% 2 == 0', '% 2 == 1', '> 2'],
            expectedOutput: '2\n4'
        },

        // ===== GRADE 12: Advanced Programming =====
        {
            id: 11,
            type: 'fill',
            typeName: 'Fill the Gap',
            mission: 'Level 11: Definisi Fungsi Fungsi',
            hint: 'Fungsi membungkus kode yang bisa dipanggil berulang dengan def!',
            concept: 'Function Definition',
            code: [
                { text: '', slot: true, answer: 'def', text2: ' sapa(nama):' },
                { text: '    print("Halo, " + nama)', indent: 1 },
                { text: '' },
                { text: 'sapa("Budi")' }
            ],
            blocks: ['def', 'function', 'fun'],
            expectedOutput: 'Halo, Budi'
        },
        {
            id: 12,
            type: 'guess',
            typeName: 'Tebak Output',
            mission: 'Level 12: Array/List Daftar',
            hint: 'List menggunakan index mulai dari 0!',
            concept: 'Array/List - Index',
            code: [
                { text: 'buah = ["apel", "jeruk", "mangga"]' },
                { text: 'print(buah[1])' }
            ],
            choices: ['apel', 'jeruk', 'mangga', 'Error'],
            answer: 'jeruk',
            expectedOutput: 'jeruk'
        },
        {
            id: 13,
            type: 'fill',
            typeName: 'Fill the Gap',
            mission: 'Level 13: While Loop',
            hint: 'While loop berjalan selama kondisi True!',
            concept: 'While Loop',
            code: [
                { text: 'x = 0' },
                { text: 'while x ', slot: true, answer: '< 3', text2: ':' },
                { text: '    print(x)', indent: 1 },
                { text: '    x = x + 1', indent: 1 }
            ],
            blocks: ['< 3', '<= 3', '== 3'],
            expectedOutput: '0\n1\n2'
        },
        {
            id: 14,
            type: 'sort',
            typeName: 'Susun Urutan',
            mission: 'Level 14: Nested If-Else PercabanganPercabangan',
            hint: 'Nested If: cek kondisi di dalam kondisi. Pertama cek >= 80, kalau True baru cek >= 90 di dalamnya.',
            concept: 'Nested Conditions',
            correctOrder: [
                'nilai = 85',
                'if nilai >= 80:',
                '    if nilai >= 90:',
                '        print("A")',
                '    else:',
                '        print("B")'
            ],
            shuffledBlocks: [
                '        print("B")',
                'nilai = 85',
                '    else:',
                '    if nilai >= 90:',
                '        print("A")',
                'if nilai >= 80:'
            ],
            expectedOutput: 'B'
        },
        {
            id: 15,
            type: 'fill',
            typeName: 'Fill the Gap',
            mission: 'Level 15: String Manipulation Panduan',
            hint: 'String punya method seperti upper(), lower(), len()!',
            concept: 'String Methods',
            code: [
                { text: 'nama = "informatika"' },
                { text: 'print(nama.', slot: true, answer: 'upper()', text2: ')' }
            ],
            blocks: ['upper()', 'lower()', 'len()'],
            expectedOutput: 'INFORMATIKA'
        }
    ];

    // ============================================
    // STATE
    // ============================================

    let currentPuzzle = null;
    let userAnswers = {};
    let sortedCode = [];
    let selectedChoice = null;
    let dragDropInitialized = false;
    let codingErrors = 0;

    // ============================================
    // INITIALIZATION
    // ============================================

    function init(levelNum) {
        currentPuzzle = puzzles[levelNum - 1] || puzzles[0];
        userAnswers = {};
        sortedCode = [];
        selectedChoice = null;
        codingErrors = 0;

        document.getElementById('coding-level').textContent = levelNum;
        document.getElementById('coding-mission').textContent = currentPuzzle.mission;
        document.getElementById('puzzle-type').textContent = `Tipe: ${currentPuzzle.typeName}`;

        // Update hint and concept if elements exist
        const hintEl = document.getElementById('coding-hint');
        if (hintEl) hintEl.textContent = currentPuzzle.hint;

        const conceptEl = document.getElementById('coding-concept');
        if (conceptEl) conceptEl.textContent = currentPuzzle.concept;

        renderPuzzle();
        renderBlocks();
        clearOutput();
        updateExpectedOutput();
        hideFeedback('coding-feedback');

        const nextBtn = document.getElementById('btn-next-puzzle');
        if (nextBtn) nextBtn.disabled = true;

        setupControls();
        animateEntrance();
    }

    // ============================================
    // ANIMATIONS
    // ============================================

    function animateEntrance() {
        anime({
            targets: '.code-editor',
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutQuart'
        });

        anime({
            targets: '.code-block',
            translateX: [-30, 0],
            opacity: [0, 1],
            delay: anime.stagger(60, { start: 200 }),
            duration: 400,
            easing: 'easeOutQuart'
        });
    }

    function animateBlockPlacement(element) {
        anime({
            targets: element,
            scale: [1.2, 1],
            duration: 300,
            easing: 'easeOutBack'
        });
    }

    function animateSuccess() {
        anime({
            targets: '.code-editor',
            borderColor: ['#22c55e', '#30363d'],
            boxShadow: ['0 0 30px rgba(34, 197, 94, 0.6)', '0 0 0px rgba(34, 197, 94, 0)'],
            duration: 800,
            easing: 'easeOutQuart'
        });

        anime({
            targets: '#output-display',
            scale: [1, 1.05, 1],
            duration: 600,
            easing: 'easeOutElastic(1, .5)'
        });
    }

    function animateError() {
        anime({
            targets: '.code-editor',
            translateX: [-5, 5, -5, 5, 0],
            borderColor: ['#ef4444', '#30363d'],
            duration: 400,
            easing: 'easeInOutSine'
        });
    }

    // ============================================
    // RENDER PUZZLE
    // ============================================

    function renderPuzzle() {
        const codeArea = document.getElementById('code-area');
        codeArea.innerHTML = '';

        if (currentPuzzle.type === 'fill') {
            renderFillPuzzle(codeArea);
        } else if (currentPuzzle.type === 'sort') {
            renderSortPuzzle(codeArea);
        } else if (currentPuzzle.type === 'guess') {
            renderGuessPuzzle(codeArea);
        } else if (currentPuzzle.type === 'debug') {
            renderDebugPuzzle(codeArea);
        }
    }

    function renderFillPuzzle(container) {
        currentPuzzle.code.forEach((line, idx) => {
            const lineEl = document.createElement('div');
            lineEl.className = 'code-line flex items-center gap-1 py-1';

            const lineNum = document.createElement('span');
            lineNum.className = 'text-dark-300 text-xs w-6 select-none';
            lineNum.textContent = idx + 1;
            lineEl.appendChild(lineNum);

            if (line.indent) {
                const indent = document.createElement('span');
                indent.style.width = `${line.indent * 20}px`;
                lineEl.appendChild(indent);
            }

            if (line.text) {
                const textSpan = document.createElement('span');
                textSpan.className = 'text-purple-400';
                textSpan.textContent = line.text;
                lineEl.appendChild(textSpan);
            }

            if (line.slot) {
                const slot = document.createElement('div');
                slot.className = 'code-slot inline-flex items-center justify-center min-w-[80px] h-7';
                slot.dataset.answer = line.answer;
                slot.dataset.index = idx;

                slot.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    slot.classList.add('drag-over');
                });
                slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
                slot.addEventListener('drop', (e) => handleSlotDrop(e, slot));

                lineEl.appendChild(slot);
            }

            if (line.text2) {
                const text2Span = document.createElement('span');
                text2Span.className = 'text-purple-400';
                text2Span.textContent = line.text2;
                lineEl.appendChild(text2Span);
            }

            container.appendChild(lineEl);
        });
    }

    function renderSortPuzzle(container) {
        const dropZone = document.createElement('div');
        dropZone.id = 'sort-drop-zone';
        dropZone.className = 'min-h-[120px] border-2 border-dashed border-dark-600 rounded-lg p-3 mb-4';
        dropZone.innerHTML = '<p class="text-dark-300 text-sm text-center">Seret blok kode ke sini dalam urutan yang benar</p>';

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', (e) => handleSortDrop(e, dropZone));

        container.appendChild(dropZone);
    }

    function renderGuessPuzzle(container) {
        // Show code
        currentPuzzle.code.forEach((line, idx) => {
            const lineEl = document.createElement('div');
            lineEl.className = 'code-line flex items-center gap-1 py-1';

            const lineNum = document.createElement('span');
            lineNum.className = 'text-dark-300 text-xs w-6 select-none';
            lineNum.textContent = idx + 1;
            lineEl.appendChild(lineNum);

            if (line.indent) {
                const indent = document.createElement('span');
                indent.style.width = `${line.indent * 20}px`;
                lineEl.appendChild(indent);
            }

            const textSpan = document.createElement('span');
            textSpan.className = 'text-amber-400';
            textSpan.textContent = line.text;
            lineEl.appendChild(textSpan);

            container.appendChild(lineEl);
        });

        // Show choices
        const choicesDiv = document.createElement('div');
        choicesDiv.className = 'mt-6 grid grid-cols-2 gap-3';

        currentPuzzle.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn glass-card p-4 rounded-xl text-center font-mono text-lg hover:border-accent-400 transition-all';
            btn.textContent = choice;
            btn.dataset.choice = choice;
            btn.addEventListener('click', () => selectChoice(btn, choice));
            choicesDiv.appendChild(btn);
        });

        container.appendChild(choicesDiv);
    }

    function renderDebugPuzzle(container) {
        currentPuzzle.buggyCode.forEach((line, idx) => {
            const lineEl = document.createElement('div');
            lineEl.className = 'code-line flex items-center gap-1 py-1';

            const lineNum = document.createElement('span');
            lineNum.className = 'text-dark-300 text-xs w-6 select-none';
            lineNum.textContent = idx + 1;
            lineEl.appendChild(lineNum);

            if (line.hasError) {
                const slot = document.createElement('div');
                slot.className = 'code-slot inline-flex items-center justify-center min-w-[120px] h-7 border-red-500 bg-red-500/20';
                slot.innerHTML = `<span class="text-red-400 line-through">${line.text}</span>`;
                slot.dataset.correct = line.correct;
                slot.dataset.index = idx;

                slot.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    slot.classList.add('drag-over');
                });
                slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
                slot.addEventListener('drop', (e) => handleDebugDrop(e, slot));

                lineEl.appendChild(slot);
            } else {
                const textSpan = document.createElement('span');
                textSpan.className = 'text-green-400';
                textSpan.textContent = line.text;
                lineEl.appendChild(textSpan);
            }

            container.appendChild(lineEl);
        });
    }

    // ============================================
    // RENDER BLOCKS
    // ============================================

    function renderBlocks() {
        const blocksArea = document.getElementById('blocks-area');
        blocksArea.innerHTML = '<h4 class="font-display font-bold text-dark-100 mb-3">Puzzle Blok Kode</h4>';

        let blocks = [];
        if (currentPuzzle.type === 'fill' || currentPuzzle.type === 'debug') {
            blocks = currentPuzzle.blocks || [];
        } else if (currentPuzzle.type === 'sort') {
            blocks = [...currentPuzzle.shuffledBlocks];
        }

        blocks.forEach((block, idx) => {
            const blockEl = document.createElement('div');
            blockEl.className = 'code-block text-white font-mono text-sm mb-2';
            blockEl.draggable = true;
            blockEl.dataset.value = block;
            blockEl.dataset.index = idx;
            blockEl.textContent = block;

            blockEl.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', block);
                e.dataTransfer.setData('index', idx.toString());
                blockEl.classList.add('dragging');
            });
            blockEl.addEventListener('dragend', () => blockEl.classList.remove('dragging'));

            blocksArea.appendChild(blockEl);
        });
    }

    // ============================================
    // DROP HANDLERS
    // ============================================

    function handleSlotDrop(e, slot) {
        e.preventDefault();
        slot.classList.remove('drag-over');

        const value = e.dataTransfer.getData('text/plain');
        const answer = slot.dataset.answer;

        slot.innerHTML = `<span class="text-accent-400 font-mono">${value}</span>`;
        slot.classList.add('filled');
        userAnswers[slot.dataset.index] = value;

        animateBlockPlacement(slot);

        // Disable the dragged block
        const blocks = document.querySelectorAll('.code-block');
        blocks.forEach(b => {
            if (b.dataset.value === value) {
                b.classList.add('used');
                b.draggable = false;
            }
        });
    }

    function handleSortDrop(e, dropZone) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');

        const value = e.dataTransfer.getData('text/plain');

        // Remove placeholder text
        const placeholder = dropZone.querySelector('p');
        if (placeholder) placeholder.remove();

        // Add to sorted list
        sortedCode.push(value);

        const lineEl = document.createElement('div');
        lineEl.className = 'code-line flex items-center gap-1 py-1';

        const lineNum = document.createElement('span');
        lineNum.className = 'text-dark-300 text-xs w-6 select-none';
        lineNum.textContent = sortedCode.length;
        lineEl.appendChild(lineNum);

        const textSpan = document.createElement('span');
        textSpan.className = 'text-amber-400 font-mono';
        textSpan.textContent = value;
        lineEl.appendChild(textSpan);

        dropZone.appendChild(lineEl);
        animateBlockPlacement(lineEl);

        // Disable the dragged block
        const blocks = document.querySelectorAll('.code-block');
        blocks.forEach(b => {
            if (b.dataset.value === value && !b.classList.contains('used')) {
                b.classList.add('used');
                b.draggable = false;
            }
        });
    }

    function handleDebugDrop(e, slot) {
        e.preventDefault();
        slot.classList.remove('drag-over');

        const value = e.dataTransfer.getData('text/plain');
        const correct = slot.dataset.correct;

        slot.innerHTML = `<span class="text-green-400 font-mono">${value}</span>`;
        slot.classList.add('filled');
        slot.classList.remove('border-red-500', 'bg-red-500/20');

        if (value === correct) {
            slot.classList.add('border-green-500', 'bg-green-500/20');
        }

        userAnswers[slot.dataset.index] = value;
        animateBlockPlacement(slot);

        // Disable the dragged block
        const blocks = document.querySelectorAll('.code-block');
        blocks.forEach(b => {
            if (b.dataset.value === value) {
                b.classList.add('used');
                b.draggable = false;
            }
        });
    }

    function selectChoice(btn, choice) {
        // Deselect others
        document.querySelectorAll('.choice-btn').forEach(b => {
            b.classList.remove('selected', 'border-accent-400', 'bg-accent-500/20');
        });

        btn.classList.add('selected', 'border-accent-400', 'bg-accent-500/20');
        selectedChoice = choice;

        anime({
            targets: btn,
            scale: [0.95, 1],
            duration: 200,
            easing: 'easeOutBack'
        });
    }

    // ============================================
    // CONTROLS
    // ============================================

    function setupControls() {
        const buttons = ['btn-run-code', 'btn-reset-code', 'btn-next-puzzle'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.replaceWith(btn.cloneNode(true));
        });

        document.getElementById('btn-run-code').addEventListener('click', runCode);
        document.getElementById('btn-reset-code').addEventListener('click', resetPuzzle);

        const nextBtn = document.getElementById('btn-next-puzzle');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentPuzzle.id < puzzles.length) {
                    const nextLevel = currentPuzzle.id + 1;
                    init(nextLevel);
                }
            });
        }
    }

    function resetPuzzle() {
        userAnswers = {};
        sortedCode = [];
        selectedChoice = null;
        renderPuzzle();
        renderBlocks();
        clearOutput();
        updateExpectedOutput();
        hideFeedback('coding-feedback');
        animateEntrance();
    }

    function clearOutput() {
        const output = document.getElementById('output-display');
        if (output) {
            output.innerHTML = '<span class="text-dark-300">Tekan Jalankan untuk melihat hasil...</span>';
        }
    }

    function updateExpectedOutput() {
        const el = document.getElementById('expected-output-display');
        if (!el || !currentPuzzle) return;

        const revealExpected = typeof GameLogicRules !== 'undefined'
            ? GameLogicRules.shouldShowExpectedOutput(currentPuzzle.type)
            : currentPuzzle.type !== 'guess';
        if (!revealExpected) {
            el.innerHTML = '<div class="text-dark-300 italic">Output disembunyikan untuk mode tebak output.</div>';
            return;
        }

        const expected = currentPuzzle.expectedOutput || '';
        const lines = expected.split('\n');
        el.innerHTML = lines.map(line => 
            `<div class="text-accent-400">${line || '&nbsp;'}</div>`
        ).join('');
    }

    // ============================================
    // CODE EXECUTION
    // ============================================

    function runCode() {
        let result = { ok: false, message: 'Belum benar. Periksa kembali kode kamu!' };

        if (currentPuzzle.type === 'fill') {
            result = validateFill();
        } else if (currentPuzzle.type === 'sort') {
            result = validateSort();
        } else if (currentPuzzle.type === 'guess') {
            result = validateGuess();
        } else if (currentPuzzle.type === 'debug') {
            result = validateDebug();
        }

        if (result.ok) {
            displayOutput(currentPuzzle.expectedOutput);
            const lesson = currentPuzzle.concept ? `<br><span class="text-xs text-dark-200">Konsep Konsep: ${currentPuzzle.concept}</span>` : '';
            showFeedback('coding-feedback', `Benar! Kode berhasil dijalankan!${lesson}`, true);
            if (typeof SoundManager !== 'undefined') SoundManager.play('success');
            animateSuccess();

            setTimeout(() => {
                completeLevel('coding', {
                    timeTaken: typeof ProgressSystem !== 'undefined' ? ProgressSystem.getLevelTime() : 0,
                    hintsUsed: 0,
                    errorsOccurred: codingErrors
                });
            }, 1000);
        } else {
            codingErrors++;
            showFeedback('coding-feedback', result.message || 'Belum benar. Periksa kembali kode kamu!', false);
            if (typeof SoundManager !== 'undefined') SoundManager.play('error');
            animateError();
        }
    }

    function validateFill() {
        const normalize = typeof GameLogicRules !== 'undefined'
            ? GameLogicRules.normalizeComparableText
            : (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
        const evaluator = typeof LearningRules !== 'undefined'
            ? LearningRules.evaluateFillAnswers
            : null;

        const outcome = evaluator
            ? evaluator(currentPuzzle.code, userAnswers, normalize)
            : { ok: true };

        if (!outcome.ok) {
            return { ok: false, message: `Cek baris ${outcome.firstWrongLine}. Susunan blok belum tepat.` };
        }
        return { ok: true };
    }

    function validateSort() {
        const evaluator = typeof LearningRules !== 'undefined'
            ? LearningRules.evaluateSortAnswers
            : null;
        const outcome = evaluator
            ? evaluator(sortedCode, currentPuzzle.correctOrder)
            : { ok: sortedCode.length === currentPuzzle.correctOrder.length && sortedCode.every((code, idx) => code === currentPuzzle.correctOrder[idx]) };

        if (!outcome.ok) {
            return { ok: false, message: `Urutan belum tepat. Cek langkah ke-${outcome.firstWrongIndex}.` };
        }
        return { ok: true };
    }

    function validateGuess() {
        if (selectedChoice === currentPuzzle.answer) return { ok: true };
        const msg = typeof ModeFeedbackRules !== 'undefined'
            ? ModeFeedbackRules.getCodingGuessMessage(selectedChoice, currentPuzzle.concept)
            : `Jawaban belum tepat. Fokus pada konsep: ${currentPuzzle.concept}.`;
        return { ok: false, message: msg };
    }

    function validateDebug() {
        const normalize = typeof GameLogicRules !== 'undefined'
            ? GameLogicRules.normalizeComparableText
            : (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

        for (let i = 0; i < currentPuzzle.buggyCode.length; i++) {
            const line = currentPuzzle.buggyCode[i];
            if (!line.hasError) continue;
            if (normalize(userAnswers[i]) !== normalize(line.correct)) {
                return { ok: false, message: `Perbaikan di baris ${i + 1} belum tepat.` };
            }
        }
        return { ok: true };
    }

    function displayOutput(output) {
        const outputEl = document.getElementById('output-display');
        if (outputEl) {
            outputEl.innerHTML = output.split('\n').map(line =>
                `<div class="text-secondary-400">${line}</div>`
            ).join('');
        }
    }

    // ============================================
    // PUBLIC API
    // ============================================

    return {
        init,
        getLevelCount: () => puzzles.length
    };
})();
