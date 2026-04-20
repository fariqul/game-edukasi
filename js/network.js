/**
 * INFORMATIKA LAB ADVENTURE
 * Mode 2: Network Mission
 * Konsep: Jaringan Komputer, Alur Data, Fungsi Perangkat, Topologi
 * 17 Levels with Progressive Difficulty (2 Cable + 15 Topology)
 */

const NetworkGame = (() => {
    // ============================================
    // CABLE COLOR DATA (T568A & T568B Standards)
    // ============================================

    const CABLE_COLORS = [
        { id: 'wo', name: 'Putih-Orange', color: '#FFD4A8', stripe: '#FF8C00' },
        { id: 'o',  name: 'Orange',       color: '#FF8C00', stripe: null },
        { id: 'wg', name: 'Putih-Hijau',  color: '#A8FFD4', stripe: '#00AA44' },
        { id: 'bl', name: 'Biru',         color: '#0066FF', stripe: null },
        { id: 'wbl',name: 'Putih-Biru',   color: '#A8D4FF', stripe: '#0066FF' },
        { id: 'g',  name: 'Hijau',        color: '#00AA44', stripe: null },
        { id: 'wbr',name: 'Putih-Coklat', color: '#D4C0A8', stripe: '#8B4513' },
        { id: 'br', name: 'Coklat',       color: '#8B4513', stripe: null }
    ];

    // T568B standard (most common for Straight)
    const T568B_ORDER = ['wo', 'o', 'wg', 'bl', 'wbl', 'g', 'wbr', 'br'];
    // T568A standard
    const T568A_ORDER = ['wg', 'g', 'wo', 'bl', 'wbl', 'o', 'wbr', 'br'];

    // ============================================
    // LEVEL DATA - 17 LEVELS (2 Cable + 15 Topology)
    // ============================================

    const levels = [
        // ===== CABLE ORDERING LEVELS =====
        {
            id: 1,
            type: 'cable',
            mission: "Level 1: Susunan Kabel Straight (T568B)",
            hint: "Kabel Straight menggunakan standar T568B di kedua ujung. Urutan: Putih-Orange, Orange, Putih-Hijau, Biru, Putih-Biru, Hijau, Putih-Coklat, Coklat.",
            concept: "Kabel Straight-Through (T568B)",
            cableType: 'straight',
            ends: [
                { label: 'Ujung A (T568B)', order: T568B_ORDER },
                { label: 'Ujung B (T568B)', order: T568B_ORDER }
            ]
        },
        {
            id: 2,
            type: 'cable',
            mission: "Level 2: Susunan Kabel Cross (T568A ke T568B)",
            hint: "Kabel Cross: ujung A menggunakan T568A, ujung B menggunakan T568B. Pin 1-2 dan 3-6 ditukar posisinya.",
            concept: "Kabel Crossover (T568A ke T568B)",
            cableType: 'cross',
            ends: [
                { label: 'Ujung A (T568A)', order: T568A_ORDER },
                { label: 'Ujung B (T568B)', order: T568B_ORDER }
            ]
        },

        // ===== BEGINNER: Direct Connections =====
        {
            id: 3,
            type: 'topology',
            mission: "Level 3: Koneksi Langsung!",
            hint: "Hubungkan PC langsung ke Server dengan kabel.",
            concept: "Direct Connection",
            required: ['pc', 'server'],
            correctTopology: [['pc', 'server']],
            requiredCables: null // null = any cable type
        },
        {
            id: 4,
            type: 'topology',
            mission: "Level 4: Dua PC, Satu Server",
            hint: "Kedua PC harus terhubung ke Server.",
            concept: "Point-to-Point",
            required: ['pc', 'pc', 'server'],
            correctTopology: [['pc', 'server'], ['pc', 'server']],
            requiredCables: null
        },

        // ===== EASY: Introducing Switch =====
        {
            id: 5,
            type: 'topology',
            mission: "Level 5: Kenali Switch!",
            hint: "Switch menghubungkan banyak perangkat dalam satu jaringan.",
            concept: "Switch - Hub Jaringan",
            required: ['pc', 'switch', 'server'],
            correctTopology: [['pc', 'switch'], ['switch', 'server']],
            requiredCables: null
        },
        {
            id: 6,
            type: 'topology',
            mission: "Level 6: LAN dengan Switch",
            hint: "Hubungkan 2 PC ke Switch, lalu Switch ke Server.",
            concept: "Local Area Network",
            required: ['pc', 'pc', 'switch', 'server'],
            correctTopology: [['pc', 'switch'], ['pc', 'switch'], ['switch', 'server']],
            requiredCables: null
        },
        {
            id: 7,
            type: 'topology',
            mission: "Level 7: Jaringan 3 PC!",
            hint: "Tiga PC berbagi satu Switch untuk akses Server.",
            concept: "Star Topology",
            required: ['pc', 'pc', 'pc', 'switch', 'server'],
            correctTopology: [['pc', 'switch'], ['pc', 'switch'], ['pc', 'switch'], ['switch', 'server']],
            requiredCables: null
        },

        // ===== MEDIUM: Router & Inter-network =====
        {
            id: 8,
            type: 'topology',
            mission: "Level 8: Kenali Router!",
            hint: "Router menghubungkan jaringan berbeda. Hubungkan: PC → Router → Server.",
            concept: "Router - Gateway",
            required: ['pc', 'router', 'server'],
            correctTopology: [['pc', 'router'], ['router', 'server']],
            requiredCables: null
        },
        {
            id: 9,
            type: 'topology',
            mission: "Level 9: Dua Jaringan Berbeda",
            hint: "Bangun 2 LAN: PC → Switch (kiri), dan Switch (kanan) → Server. Sambungkan keduanya lewat Router di tengah.",
            concept: "Inter-Network Communication",
            required: ['pc', 'switch', 'router', 'switch', 'server'],
            correctTopology: [['pc', 'switch'], ['switch', 'router'], ['router', 'switch'], ['switch', 'server']],
            requiredCables: null
        },
        {
            id: 10,
            type: 'topology',
            mission: "Level 10: Jaringan Kantor",
            hint: "Jaringan kantor: 2 PC terhubung ke Switch → Switch ke Router → Router ke Switch lain → Switch ke Server.",
            concept: "Enterprise Network",
            required: ['pc', 'pc', 'switch', 'router', 'switch', 'server'],
            correctTopology: [['pc', 'switch'], ['pc', 'switch'], ['switch', 'router'], ['router', 'switch'], ['switch', 'server']],
            requiredCables: null
        },

        // ===== ADVANCED: Complex Topologies =====
        {
            id: 11,
            type: 'topology',
            mission: "Level 11: Dual Server Setup",
            hint: "Redundansi data: 2 PC → Switch → Router → Switch → 2 Server (utama + backup). Pastikan kedua server terhubung ke switch yang sama.",
            concept: "Redundancy",
            required: ['pc', 'pc', 'switch', 'router', 'switch', 'server', 'server'],
            correctTopology: [
                ['pc', 'switch'], ['pc', 'switch'],
                ['switch', 'router'], ['router', 'switch'],
                ['switch', 'server'], ['switch', 'server']
            ],
            requiredCables: null
        },
        {
            id: 12,
            type: 'topology',
            mission: "Level 12: Master Network!",
            hint: "Enterprise Network: 3 PC ke Switch kiri → Router di tengah → Switch kanan ke 2 Server. Ini arsitektur jaringan perusahaan!",
            concept: "Complex Enterprise Network",
            required: ['pc', 'pc', 'pc', 'switch', 'switch', 'router', 'server', 'server'],
            correctTopology: [
                ['pc', 'switch'], ['pc', 'switch'], ['pc', 'switch'],
                ['switch', 'router'], ['router', 'switch'],
                ['switch', 'server'], ['switch', 'server']
            ],
            requiredCables: null
        },

        // ===== GRADE 12: Advanced Networking Concepts =====
        {
            id: 13,
            type: 'topology',
            mission: "Level 13: IP Addressing Basics",
            hint: "Setiap perangkat butuh IP unik! Hubungkan: 2 PC → Router → Server. Gunakan kabel ethernet (straight-through).",
            concept: "IP Address - Layer 3",
            required: ['pc', 'pc', 'router', 'server'],
            correctTopology: [
                ['pc', 'router'], ['pc', 'router'], ['router', 'server']
            ],
            requiredCables: 'ethernet',
            ipConfig: {
                pc1: '192.168.1.10',
                pc2: '192.168.1.11',
                router: '192.168.1.1',
                server: '192.168.2.1'
            }
        },
        {
            id: 14,
            type: 'topology',
            mission: "Level 14: Subnetting Visual",
            hint: "Pisahkan jaringan menjadi beberapa subnet untuk keamanan!",
            concept: "Subnetting - Network Segmentation",
            required: ['pc', 'pc', 'switch', 'router', 'switch', 'pc', 'pc', 'server'],
            correctTopology: [
                ['pc', 'switch'], ['pc', 'switch'],
                ['switch', 'router'],
                ['router', 'switch'],
                ['switch', 'pc'], ['switch', 'pc'],
                ['router', 'server']
            ],
            requiredCables: null,
            subnets: ['192.168.1.0/24', '192.168.2.0/24']
        },
        {
            id: 15,
            type: 'topology',
            mission: "Level 15: Protocol Layers",
            hint: "Data melewati 7 layer OSI saat dikirim antar jaringan. Hubungkan: PC → Switch → Router → Router → Switch → Server.",
            concept: "OSI Model - 7 Layers",
            required: ['pc', 'switch', 'router', 'router', 'switch', 'server'],
            correctTopology: [
                ['pc', 'switch'], ['switch', 'router'],
                ['router', 'router'],
                ['router', 'switch'], ['switch', 'server']
            ],
            requiredCables: null,
            showLayers: true
        },
        {
            id: 16,
            type: 'topology',
            mission: "Level 16: DNS & DHCP Server",
            hint: "DNS menerjemahkan nama domain ke IP. DHCP memberikan IP otomatis!",
            concept: "DNS & DHCP Services",
            required: ['pc', 'pc', 'pc', 'switch', 'router', 'dns-server', 'dhcp-server'],
            correctTopology: [
                ['pc', 'switch'], ['pc', 'switch'], ['pc', 'switch'],
                ['switch', 'router'],
                ['router', 'dns-server'], ['router', 'dhcp-server']
            ],
            requiredCables: null
        },
        {
            id: 17,
            type: 'topology',
            mission: "Level 17: Firewall Security!",
            hint: "Keamanan Enterprise: 2 PC → Switch → Firewall → Router → Switch → 2 Server. Firewall menyaring traffic berbahaya sebelum masuk jaringan.",
            concept: "Network Security - Firewall",
            required: ['pc', 'pc', 'switch', 'firewall', 'router', 'switch', 'server', 'server'],
            correctTopology: [
                ['pc', 'switch'], ['pc', 'switch'],
                ['switch', 'firewall'],
                ['firewall', 'router'],
                ['router', 'switch'],
                ['switch', 'server'], ['switch', 'server']
            ],
            requiredCables: null,
            securityLevel: 'enterprise'
        }
    ];

    // ============================================
    // STATE
    // ============================================

    let currentLevel = null;
    let placedDevices = [];
    let connections = [];
    let selectedDevice = null;
    let connectMode = false;
    let deviceIdCounter = 0;
    let deviceCounts = {};
    let dragDropInitialized = false;
    let selectedCableType = 'straight';

    const STRAIGHT_PAIRS = [
        ['pc', 'switch'], ['pc', 'router'], ['switch', 'router'],
        ['switch', 'server'], ['router', 'server'], ['pc', 'server'],
        ['switch', 'firewall'], ['firewall', 'router'],
        ['router', 'dns-server'], ['router', 'dhcp-server'],
        ['pc', 'firewall'], ['firewall', 'server']
    ];
    const CROSS_PAIRS = [
        ['pc', 'pc'], ['switch', 'switch'], ['router', 'router']
    ];

    function getCorrectCableType(type1, type2) {
        const sorted = [type1, type2].sort();
        const isCross = CROSS_PAIRS.some(p => {
            const ps = [...p].sort();
            return ps[0] === sorted[0] && ps[1] === sorted[1];
        });
        return isCross ? 'cross' : 'straight';
    }

    function getRequiredCablesForLevel(level) {
        const cableSet = new Set();
        level.correctTopology.forEach(pair => {
            cableSet.add(getCorrectCableType(pair[0], pair[1]));
        });
        return [...cableSet];
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    function init(levelNum) {
        currentLevel = levels[levelNum - 1] || levels[0];
        placedDevices = [];
        connections = [];
        selectedDevice = null;
        connectMode = false;
        deviceIdCounter = 0;

        document.getElementById('network-level').textContent = levelNum;
        document.getElementById('network-mission').textContent = currentLevel.mission;

        // Update hint and concept if elements exist
        const hintEl = document.getElementById('network-hint');
        if (hintEl) hintEl.textContent = currentLevel.hint;

        const conceptEl = document.getElementById('network-concept');
        if (conceptEl) conceptEl.textContent = currentLevel.concept;

        hideFeedback('network-feedback');

        // Switch between cable mode and topology mode
        const cableWorkspace = document.getElementById('cable-workspace');
        const topoWorkspace = document.getElementById('topology-workspace');
        const topoControls = document.getElementById('topology-controls');
        const cableInfoPanel = document.getElementById('cable-info-panel');
        const requiredCablePanel = document.getElementById('required-cable-panel');

        if (currentLevel.type === 'cable') {
            // Show cable workspace, hide topology workspace
            if (cableWorkspace) cableWorkspace.style.display = '';
            if (topoWorkspace) topoWorkspace.style.display = 'none';
            if (topoControls) topoControls.style.display = 'none';
            if (cableInfoPanel) cableInfoPanel.style.display = 'none';
            if (requiredCablePanel) requiredCablePanel.style.display = 'none';
            initCableGame();
        } else {
            // Show topology workspace, hide cable workspace
            if (cableWorkspace) cableWorkspace.style.display = 'none';
            if (topoWorkspace) topoWorkspace.style.display = '';
            if (topoControls) topoControls.style.display = '';
            if (cableInfoPanel) cableInfoPanel.style.display = '';
            if (requiredCablePanel) requiredCablePanel.style.display = '';
            renderDevicePalette();
            clearCanvas();
            updateRequiredCableHint();
            setupDragDrop();
            setupControls();
        }

        animateEntrance();
    }

    // ============================================
    // CABLE ORDERING GAME
    // ============================================

    let cableDragState = { draggedWire: null };

    function initCableGame() {
        const workspace = document.getElementById('cable-workspace');
        if (!workspace) return;

        workspace.innerHTML = '';

        // Build connector UI for each end
        const endsContainer = document.createElement('div');
        endsContainer.className = 'grid md:grid-cols-2 gap-6';

        currentLevel.ends.forEach((end, endIdx) => {
            const endDiv = document.createElement('div');
            endDiv.className = 'glass-card rounded-2xl p-5';
            endDiv.innerHTML = `
                <h4 class="font-display font-bold text-center mb-4 ${endIdx === 0 ? 'text-secondary-400' : 'text-accent-400'}">
                    <svg class="w-5 h-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    ${end.label}
                </h4>
                <div class="cable-connector-visual mb-4" id="connector-end-${endIdx}">
                    <div class="rj45-body">
                        <div class="rj45-slots" id="cable-slots-${endIdx}"></div>
                        <div class="rj45-clip"></div>
                    </div>
                    <div class="pin-numbers flex justify-between px-1 mt-1">
                        ${[1,2,3,4,5,6,7,8].map(n => `<span class="text-[10px] text-dark-300 w-6 text-center">${n}</span>`).join('')}
                    </div>
                </div>
                <div class="wire-palette flex flex-wrap gap-2 justify-center" id="wire-palette-${endIdx}"></div>
            `;
            endsContainer.appendChild(endDiv);
        });

        workspace.appendChild(endsContainer);

        // Validate button
        const validateBtn = document.createElement('button');
        validateBtn.className = 'btn-success px-6 py-3 rounded-xl font-bold text-white mt-6 mx-auto block';
        validateBtn.id = 'btn-validate-cable';
        validateBtn.innerHTML = '<svg class="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Validasi Susunan Kabel';
        validateBtn.addEventListener('click', validateCableOrder);
        workspace.appendChild(validateBtn);

        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-danger px-4 py-2 rounded-xl font-semibold text-white mt-3 mx-auto block text-sm';
        resetBtn.innerHTML = '<svg class="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> Reset Kabel';
        resetBtn.addEventListener('click', () => initCableGame());
        workspace.appendChild(resetBtn);

        // Populate slots and palette for each end
        currentLevel.ends.forEach((end, endIdx) => {
            renderCableSlots(endIdx);
            renderWirePalette(endIdx, end.order);
        });
    }

    function renderCableSlots(endIdx) {
        const slotsContainer = document.getElementById(`cable-slots-${endIdx}`);
        if (!slotsContainer) return;
        slotsContainer.innerHTML = '';

        for (let i = 0; i < 8; i++) {
            const slot = document.createElement('div');
            slot.className = 'cable-slot';
            slot.dataset.endIdx = endIdx;
            slot.dataset.slotIdx = i;
            slot.setAttribute('title', `Pin ${i + 1}`);

            // Drop handlers
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                handleWireDrop(slot, endIdx, i);
            });

            // Click to remove wire
            slot.addEventListener('click', () => {
                if (slot.dataset.wireId) {
                    returnWireToPalette(endIdx, slot.dataset.wireId);
                    slot.dataset.wireId = '';
                    slot.style.background = '';
                    slot.innerHTML = '';
                    slot.classList.remove('filled');
                }
            });

            slotsContainer.appendChild(slot);
        }
    }

    function renderWirePalette(endIdx, correctOrder) {
        const palette = document.getElementById(`wire-palette-${endIdx}`);
        if (!palette) return;
        palette.innerHTML = '';

        // Shuffle the wires
        const shuffled = shuffleArray([...CABLE_COLORS]);

        shuffled.forEach(wire => {
            const wireEl = document.createElement('div');
            wireEl.className = 'wire-item';
            wireEl.draggable = true;
            wireEl.dataset.wireId = wire.id;
            wireEl.dataset.endIdx = endIdx;

            if (wire.stripe) {
                wireEl.style.background = `repeating-linear-gradient(90deg, ${wire.color} 0px, ${wire.color} 3px, ${wire.stripe} 3px, ${wire.stripe} 6px)`;
            } else {
                wireEl.style.background = wire.color;
            }
            wireEl.setAttribute('title', wire.name);
            wireEl.innerHTML = `<span class="wire-label">${wire.name}</span>`;

            wireEl.addEventListener('dragstart', (e) => {
                cableDragState.draggedWire = wire.id;
                cableDragState.sourceEndIdx = endIdx;
                wireEl.classList.add('dragging');
                e.dataTransfer.setData('text/plain', wire.id);
            });
            wireEl.addEventListener('dragend', () => {
                wireEl.classList.remove('dragging');
                cableDragState.draggedWire = null;
            });

            // Click-to-place: auto-fill next empty slot
            wireEl.addEventListener('click', () => {
                const slots = document.querySelectorAll(`#cable-slots-${endIdx} .cable-slot:not(.filled)`);
                if (slots.length > 0) {
                    placeWireInSlot(slots[0], endIdx, parseInt(slots[0].dataset.slotIdx), wire.id);
                    wireEl.classList.add('used');
                    wireEl.draggable = false;
                }
            });

            palette.appendChild(wireEl);
        });
    }

    function handleWireDrop(slot, endIdx, slotIdx) {
        const wireId = cableDragState.draggedWire;
        if (!wireId) return;
        // Only accept drops from same connector end
        if (cableDragState.sourceEndIdx !== endIdx) return;

        // If slot already has a wire, return it first
        if (slot.dataset.wireId) {
            returnWireToPalette(endIdx, slot.dataset.wireId);
        }

        placeWireInSlot(slot, endIdx, slotIdx, wireId);

        // Hide wire from palette
        const paletteWire = document.querySelector(`#wire-palette-${endIdx} .wire-item[data-wire-id="${wireId}"]`);
        if (paletteWire) {
            paletteWire.classList.add('used');
            paletteWire.draggable = false;
        }
    }

    function placeWireInSlot(slot, endIdx, slotIdx, wireId) {
        const wire = CABLE_COLORS.find(w => w.id === wireId);
        if (!wire) return;

        slot.dataset.wireId = wireId;
        slot.classList.add('filled');

        if (wire.stripe) {
            slot.style.background = `repeating-linear-gradient(0deg, ${wire.color} 0px, ${wire.color} 3px, ${wire.stripe} 3px, ${wire.stripe} 6px)`;
        } else {
            slot.style.background = wire.color;
        }
        slot.innerHTML = '';

        if (typeof SoundManager !== 'undefined') SoundManager.play('place');

        // Animate placement
        if (typeof anime !== 'undefined') {
            anime({
                targets: slot,
                scale: [0.7, 1.1, 1],
                duration: 300,
                easing: 'easeOutBack'
            });
        }
    }

    function returnWireToPalette(endIdx, wireId) {
        const paletteWire = document.querySelector(`#wire-palette-${endIdx} .wire-item[data-wire-id="${wireId}"]`);
        if (paletteWire) {
            paletteWire.classList.remove('used');
            paletteWire.draggable = true;
        }
    }

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function validateCableOrder() {
        let allCorrect = true;
        const errors = [];

        currentLevel.ends.forEach((end, endIdx) => {
            const slots = document.querySelectorAll(`#cable-slots-${endIdx} .cable-slot`);
            const placed = [];
            let hasEmpty = false;

            slots.forEach((slot, i) => {
                const wireId = slot.dataset.wireId;
                if (!wireId) {
                    hasEmpty = true;
                    placed.push(null);
                } else {
                    placed.push(wireId);
                }
            });

            if (hasEmpty) {
                allCorrect = false;
                errors.push(`${end.label}: Belum semua pin terisi!`);
                // Shake empty slots
                slots.forEach(slot => {
                    if (!slot.dataset.wireId) {
                        slot.classList.add('error-shake');
                        setTimeout(() => slot.classList.remove('error-shake'), 600);
                    }
                });
                return;
            }

            // Check order
            let endCorrect = true;
            slots.forEach((slot, i) => {
                if (slot.dataset.wireId !== end.order[i]) {
                    endCorrect = false;
                    slot.classList.add('wrong');
                } else {
                    slot.classList.add('correct');
                }
            });

            if (!endCorrect) {
                allCorrect = false;
                errors.push(`${end.label}: Urutan warna belum tepat!`);
            }
        });

        // Clear visual feedback after delay
        setTimeout(() => {
            document.querySelectorAll('.cable-slot.wrong, .cable-slot.correct').forEach(el => {
                el.classList.remove('wrong', 'correct');
            });
        }, 2000);

        if (!allCorrect) {
            if (typeof SoundManager !== 'undefined') SoundManager.play('error');
            showFeedback('network-feedback', `${errors.join(' | ')}`, false);
            // Shake workspace
            if (typeof anime !== 'undefined') {
                anime({
                    targets: '#cable-workspace',
                    translateX: [-5, 5, -5, 5, 0],
                    duration: 400,
                    easing: 'easeInOutSine'
                });
            }
            return;
        }

        // Success!
        if (typeof SoundManager !== 'undefined') SoundManager.play('success');

        // Celebrate: animate all slots to green glow
        document.querySelectorAll('.cable-slot.filled').forEach((slot, i) => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: slot,
                    scale: [1, 1.15, 1],
                    delay: i * 50,
                    duration: 400,
                    easing: 'easeOutElastic(1, .6)'
                });
            }
        });

        const cableLabel = currentLevel.cableType === 'straight' ? 'Straight-Through' : 'Crossover';
        showFeedback('network-feedback', `Sempurna! Susunan kabel ${cableLabel} benar!`, true);

        setTimeout(() => {
            completeLevel('network', {
                timeTaken: typeof ProgressSystem !== 'undefined' ? ProgressSystem.getLevelTime() : 0,
                hintsUsed: 0,
                errorsOccurred: 0
            });
        }, 2000);
    }

    // ============================================
    // REQUIRED CABLE HINT (Topology levels only)
    // ============================================

    function updateRequiredCableHint() {
        const el = document.getElementById('required-cable-hint');
        if (!el) return;
        if (!currentLevel.correctTopology) { el.innerHTML = ''; return; }

        const cables = getRequiredCablesForLevel(currentLevel);

        // Build a detailed list of which cable per connection
        const details = [];
        const seen = new Set();
        currentLevel.correctTopology.forEach(pair => {
            const key = [...pair].sort().join('-');
            if (seen.has(key)) return;
            seen.add(key);
            const cableType = getCorrectCableType(pair[0], pair[1]);
            const label = cableType === 'straight' ? '━━━ Straight' : '━╳━ Cross';
            const color = cableType === 'straight' ? 'text-green-400' : 'text-yellow-400';
            details.push(`<span class="inline-flex items-center gap-1"><span class="${color} font-bold">${label}</span> <span class="text-dark-200">(${pair[0].toUpperCase()} ke ${pair[1].toUpperCase()})</span></span>`);
        });

        el.innerHTML = details.join('<span class="text-dark-300 mx-1">|</span>');
    }

    // ============================================
    // ANIMATIONS
    // ============================================

    function animateEntrance() {
        anime({
            targets: '.network-device',
            translateY: [20, 0],
            opacity: [0, 1],
            delay: anime.stagger(80),
            duration: 400,
            easing: 'easeOutQuart'
        });
    }

    function animateDevicePlacement(device) {
        anime({
            targets: device,
            scale: [0, 1],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutBack'
        });
    }

    function animateConnection(line) {
        const length = line.getTotalLength ? line.getTotalLength() : 100;
        line.style.strokeDasharray = length;
        line.style.strokeDashoffset = length;

        anime({
            targets: line,
            strokeDashoffset: [length, 0],
            duration: 500,
            easing: 'easeOutQuart'
        });
    }

    // ============================================
    // DEVICE PALETTE
    // ============================================

    function renderDevicePalette() {
        const palette = document.getElementById('device-palette');

        deviceCounts = {};
        currentLevel.required.forEach(d => {
            deviceCounts[d] = (deviceCounts[d] || 0) + 1;
        });

        // Destroy any existing palette Lottie instances
        if (typeof LottieManager !== 'undefined') LottieManager.destroyInScope('#device-palette');

        palette.innerHTML = '<h4 class="font-display font-bold text-dark-100 mb-4"><svg class="inline w-5 h-5 mr-1 -mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>Perangkat</h4>';

        const devices = [
            { type: 'pc', lottie: 'device-pc', name: 'PC' },
            { type: 'switch', lottie: 'device-switch', name: 'Switch' },
            { type: 'router', lottie: 'device-router', name: 'Router' },
            { type: 'server', lottie: 'device-server', name: 'Server' }
        ];

        devices.forEach(device => {
            if (deviceCounts[device.type]) {
                const item = document.createElement('div');
                item.className = 'network-device flex items-center gap-3 mb-3';
                item.draggable = true;
                item.dataset.device = device.type;
                const iconId = `net-pal-${device.type}`;
                item.innerHTML = `
                    <div id="${iconId}" class="w-10 h-10 flex-shrink-0"></div>
                    <span class="font-medium">${device.name} <span class="text-secondary-400">(${deviceCounts[device.type]})</span></span>
                `;
                palette.appendChild(item);
                if (typeof LottieManager !== 'undefined') {
                    LottieManager.create(`#${iconId}`, device.lottie, { lazy: false });
                }
            }
        });
    }

    function updatePaletteCount(deviceType) {
        deviceCounts[deviceType] = (deviceCounts[deviceType] || 1) - 1;
        const count = deviceCounts[deviceType];

        const item = document.querySelector(`.network-device[data-device="${deviceType}"]`);
        if (item) {
            const deviceNames = { 'pc': 'PC', 'switch': 'Switch', 'router': 'Router', 'server': 'Server' };

            if (count <= 0) {
                item.classList.add('used');
                item.draggable = false;
                anime({
                    targets: item,
                    opacity: 0.4,
                    scale: 0.95,
                    duration: 300,
                    easing: 'easeOutQuart'
                });
            }

            const span = item.querySelector('span:last-child');
            span.innerHTML = `${deviceNames[deviceType]} <span class="text-secondary-400">(${count})</span>`;
        }
    }

    // ============================================
    // CANVAS
    // ============================================

    function clearCanvas() {
        // Destroy Lottie instances on canvas before clearing
        if (typeof LottieManager !== 'undefined') LottieManager.destroyInScope('#canvas-area');

        const canvas = document.getElementById('canvas-area');
        canvas.innerHTML = `
            <p class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-dark-200 text-center pointer-events-none">
                Seret perangkat ke sini dan hubungkan dengan klik
            </p>
        `;
        document.getElementById('connection-svg').innerHTML = '';
        placedDevices = [];
        connections = [];
    }

    function placeDevice(type, x, y) {
        const canvas = document.getElementById('canvas-area');
        const id = `device-${deviceIdCounter++}`;

        const lottieMap = { 'pc': 'device-pc', 'switch': 'device-switch', 'router': 'device-router', 'server': 'device-server' };
        const iconContainerId = `${id}-icon`;

        const device = document.createElement('div');
        device.id = id;
        device.className = 'placed-device flex items-center gap-2';
        device.dataset.type = type;
        device.style.left = `${x}px`;
        device.style.top = `${y}px`;
        device.innerHTML = `
            <div id="${iconContainerId}" class="w-8 h-8 flex-shrink-0"></div>
            <span class="font-medium text-sm">${type.toUpperCase()}</span>
        `;

        device.addEventListener('click', () => handleDeviceClick(id));
        canvas.appendChild(device);

        if (typeof LottieManager !== 'undefined') {
            LottieManager.create(`#${iconContainerId}`, lottieMap[type], { lazy: false });
        }

        animateDevicePlacement(device);

        placedDevices.push({ id, type, x: x + 40, y: y + 25 });
        if (typeof SoundManager !== 'undefined') SoundManager.play('place');
        updatePaletteCount(type);

        const placeholder = canvas.querySelector('p');
        if (placeholder) placeholder.style.display = 'none';
    }

    function handleDeviceClick(deviceId) {
        if (!connectMode) return;

        const device = placedDevices.find(d => d.id === deviceId);
        if (!device) return;

        const element = document.getElementById(deviceId);

        if (!selectedDevice) {
            selectedDevice = deviceId;
            element.classList.add('selected');

            anime({
                targets: element,
                scale: 1.05,
                duration: 200,
                easing: 'easeOutQuart'
            });
        } else if (selectedDevice === deviceId) {
            element.classList.remove('selected');
            anime({
                targets: element,
                scale: 1,
                duration: 200,
                easing: 'easeOutQuart'
            });
            selectedDevice = null;
        } else {
            createConnection(selectedDevice, deviceId);

            const prevElement = document.getElementById(selectedDevice);
            if (prevElement) {
                prevElement.classList.remove('selected');
                anime({
                    targets: prevElement,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuart'
                });
            }
            selectedDevice = null;
        }
    }

    function createConnection(device1Id, device2Id) {
        const exists = connections.some(c =>
            (c.from === device1Id && c.to === device2Id) ||
            (c.from === device2Id && c.to === device1Id)
        );

        if (exists) return;

        connections.push({
            from: device1Id,
            to: device2Id,
            cableType: selectedCableType
        });
        if (typeof SoundManager !== 'undefined') SoundManager.play('connect');
        renderConnections();
    }

    function renderConnections() {
        const svg = document.getElementById('connection-svg');
        svg.innerHTML = '';

        connections.forEach((conn, index) => {
            const from = placedDevices.find(d => d.id === conn.from);
            const to = placedDevices.find(d => d.id === conn.to);

            if (from && to) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', from.x);
                line.setAttribute('y1', from.y);
                line.setAttribute('x2', to.x);
                line.setAttribute('y2', to.y);

                if (conn.cableType === 'cross') {
                    line.setAttribute('stroke', '#f59e0b');
                    line.setAttribute('stroke-dasharray', '8,4');
                } else {
                    line.setAttribute('stroke', '#22c55e');
                }
                line.setAttribute('stroke-width', '3');
                line.setAttribute('stroke-linecap', 'round');

                svg.appendChild(line);

                if (index === connections.length - 1) {
                    animateConnection(line);
                }
            }
        });
    }

    // ============================================
    // DRAG & DROP
    // ============================================

    function setupDragDrop() {
        if (dragDropInitialized) return;
        dragDropInitialized = true;

        const palette = document.getElementById('device-palette');
        const canvas = document.getElementById('canvas-area');

        palette.addEventListener('dragstart', (e) => {
            const device = e.target.closest('.network-device');
            if (device && !device.classList.contains('used')) {
                e.dataTransfer.setData('text/plain', device.dataset.device);
                device.style.opacity = '0.5';
            }
        });

        palette.addEventListener('dragend', (e) => {
            const device = e.target.closest('.network-device');
            if (device) {
                device.style.opacity = '';
            }
        });

        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            canvas.style.background = 'rgba(34, 197, 94, 0.1)';
        });

        canvas.addEventListener('dragleave', () => {
            canvas.style.background = '';
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            canvas.style.background = '';

            const deviceType = e.dataTransfer.getData('text/plain');
            if (deviceType && deviceCounts[deviceType] > 0) {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left - 40;
                const y = e.clientY - rect.top - 25;
                placeDevice(deviceType, Math.max(0, x), Math.max(0, y));
            }
        });
    }

    // ============================================
    // CONTROLS
    // ============================================

    function setupControls() {
        const buttons = ['btn-clear-network', 'btn-connect-mode', 'btn-validate-network'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.replaceWith(btn.cloneNode(true));
        });

        document.getElementById('btn-clear-network').addEventListener('click', () => {
            renderDevicePalette();
            clearCanvas();
            hideFeedback('network-feedback');
            animateEntrance();
        });

        document.getElementById('btn-connect-mode').addEventListener('click', () => {
            connectMode = !connectMode;
            const btn = document.getElementById('btn-connect-mode');
            if (connectMode) {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-success');
                btn.innerHTML = '<svg class="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg> Mode Kabel: ON';
            } else {
                btn.classList.remove('btn-success');
                btn.classList.add('btn-primary');
                btn.innerHTML = '<svg class="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg> Mode Kabel';
                selectedDevice = null;
                document.querySelectorAll('.placed-device.selected').forEach(el => {
                    el.classList.remove('selected');
                });
            }
        });

        document.getElementById('btn-validate-network').addEventListener('click', validateNetwork);

        setupCableButtons();
    }

    function setupCableButtons() {
        const btnStraight = document.getElementById('btn-cable-straight');
        const btnCross = document.getElementById('btn-cable-cross');

        if (!btnStraight || !btnCross) return;

        btnStraight.classList.add('active', 'straight');
        btnCross.classList.remove('active');
        selectedCableType = 'straight';

        btnStraight.replaceWith(btnStraight.cloneNode(true));
        btnCross.replaceWith(btnCross.cloneNode(true));

        document.getElementById('btn-cable-straight').addEventListener('click', () => {
            selectedCableType = 'straight';
            document.getElementById('btn-cable-straight').classList.add('active', 'straight');
            document.getElementById('btn-cable-cross').classList.remove('active', 'cross');
        });

        document.getElementById('btn-cable-cross').addEventListener('click', () => {
            selectedCableType = 'cross';
            document.getElementById('btn-cable-cross').classList.add('active', 'cross');
            document.getElementById('btn-cable-straight').classList.remove('active', 'straight');
        });
    }

    // ============================================
    // VALIDATION
    // ============================================

    function validateNetwork() {
        const placedTypes = placedDevices.map(d => d.type);
        const requiredTypes = [...currentLevel.required].sort();
        const placedSorted = [...placedTypes].sort();

        if (JSON.stringify(placedSorted) !== JSON.stringify(requiredTypes)) {
            showFeedback('network-feedback', 'Belum semua perangkat ditempatkan!', false);
            anime({
                targets: '#network-canvas',
                translateX: [-5, 5, -5, 5, 0],
                duration: 400,
                easing: 'easeInOutSine'
            });
            return;
        }

        if (connections.length < currentLevel.correctTopology.length) {
            showFeedback('network-feedback', 'Koneksi belum lengkap! Hubungkan semua perangkat.', false);
            return;
        }
        if (connections.length > currentLevel.correctTopology.length) {
            showFeedback('network-feedback', 'Koneksi berlebihan. Hapus kabel yang tidak diperlukan.', false);
            return;
        }

        const topologyResult = validateTopology();

        if (!topologyResult.ok) {
            showFeedback('network-feedback', topologyResult.message || `Topologi belum benar! Hint: ${currentLevel.hint}`, false);
            anime({
                targets: '#network-canvas',
                translateX: [-5, 5, -5, 5, 0],
                duration: 400,
                easing: 'easeInOutSine'
            });
            return;
        }

        // Validate cable types per connection
        const cableErrors = validateCableTypes();
        if (cableErrors.length > 0) {
            const errMsg = cableErrors[0];
            showFeedback('network-feedback', errMsg, false);
            anime({
                targets: '#network-canvas',
                translateX: [-5, 5, -5, 5, 0],
                duration: 400,
                easing: 'easeInOutSine'
            });
            return;
        }

        if (typeof SoundManager !== 'undefined') SoundManager.play('success');
        animateDataFlow();
        setTimeout(() => {
            completeLevel('network', {
                timeTaken: typeof ProgressSystem !== 'undefined' ? ProgressSystem.getLevelTime() : 0,
                hintsUsed: 0,
                errorsOccurred: 0
            });
        }, 2000);
    }

    function validateTopology() {
        const connectedPairs = connections.map(c => {
            const from = placedDevices.find(d => d.id === c.from);
            const to = placedDevices.find(d => d.id === c.to);
            return [from?.type, to?.type].sort();
        });

        const requiredPairs = currentLevel.correctTopology.map(p => [...p].sort());

        const diff = typeof LearningRules !== 'undefined' && typeof LearningRules.explainTopologyDiff === 'function'
            ? LearningRules.explainTopologyDiff(connectedPairs, requiredPairs)
            : null;
        if (diff && !diff.exact) {
            const missingHint = diff.missing.length > 0 ? `Kurang: ${diff.missing.map(formatPairKey).join(', ')}` : '';
            const extraHint = diff.extra.length > 0 ? `Lebih: ${diff.extra.map(formatPairKey).join(', ')}` : '';
            return {
                ok: false,
                message: `Topologi belum tepat. ${[missingHint, extraHint].filter(Boolean).join(' | ')}`
            };
        }

        // Wajib exact match: tidak boleh ada koneksi kurang/lebih.
        if (typeof GameLogicRules !== 'undefined' && typeof GameLogicRules.isExactTopologyMatch === 'function') {
            const ok = GameLogicRules.isExactTopologyMatch(connectedPairs, requiredPairs);
            return ok ? { ok: true } : { ok: false, message: `Topologi belum benar! Hint: ${currentLevel.hint}` };
        }

        // Fallback legacy
        if (connectedPairs.length !== requiredPairs.length) return { ok: false, message: 'Jumlah koneksi tidak sesuai kebutuhan level.' };
        const requiredCounts = {};
        requiredPairs.forEach(pair => {
            const key = pair.join('-');
            requiredCounts[key] = (requiredCounts[key] || 0) + 1;
        });
        const connectedCounts = {};
        connectedPairs.forEach(pair => {
            const key = pair.join('-');
            connectedCounts[key] = (connectedCounts[key] || 0) + 1;
        });
        for (const [key, count] of Object.entries(requiredCounts)) {
            if ((connectedCounts[key] || 0) !== count) return { ok: false, message: `Koneksi ${formatPairKey(key)} belum sesuai.` };
        }
        const ok = Object.keys(connectedCounts).length === Object.keys(requiredCounts).length;
        return ok ? { ok: true } : { ok: false, message: 'Ada koneksi yang tidak diperlukan.' };
    }

    function formatPairKey(key) {
        const [a, b] = key.split('-');
        return `${(a || '').toUpperCase()}ke${(b || '').toUpperCase()}`;
    }

    function validateCableTypes() {
        const errors = [];
        connections.forEach(conn => {
            const from = placedDevices.find(d => d.id === conn.from);
            const to = placedDevices.find(d => d.id === conn.to);
            if (!from || !to) return;

            const correct = getCorrectCableType(from.type, to.type);
            if (conn.cableType !== correct) {
                const fromName = from.type.toUpperCase();
                const toName = to.type.toUpperCase();
                const correctLabel = correct === 'straight' ? 'Straight (━━━)' : 'Crossover (━╳━)';
                const usedLabel = conn.cableType === 'straight' ? 'Straight (━━━)' : 'Crossover (━╳━)';
                errors.push(`Kabel salah antara ${fromName} ke ${toName}! Kamu pakai ${usedLabel}, seharusnya ${correctLabel}.`);
            }
        });
        return errors;
    }

    function animateDataFlow() {
        const path = buildDataPath();
        const route = typeof ModeFeedbackRules !== 'undefined'
            ? ModeFeedbackRules.formatNetworkPathSummary(path)
            : '';
        const routeMsg = route ? `<br><span class="text-xs text-dark-200">Rute data: ${route}</span>` : '';
        showFeedback('network-feedback', `Jaringan terhubung! Data mengalir...${routeMsg}`, true);

        if (path.length < 2) {
            simpleDataAnimation();
            return;
        }

        const canvas = document.getElementById('canvas-area');

        animatePacketAlongPath(canvas, path, 0);
        setTimeout(() => animatePacketAlongPath(canvas, path, 1), 300);
        setTimeout(() => animatePacketAlongPath(canvas, path, 2), 600);
    }

    function buildDataPath() {
        const pc = placedDevices.find(d => d.type === 'pc');
        const server = placedDevices.find(d => d.type === 'server');

        if (!pc || !server) return [];

        const visited = new Set();
        const queue = [[pc]];

        while (queue.length > 0) {
            const path = queue.shift();
            const current = path[path.length - 1];

            if (current.id === server.id) return path;
            if (visited.has(current.id)) continue;
            visited.add(current.id);

            for (const conn of connections) {
                let neighborId = null;
                if (conn.from === current.id) neighborId = conn.to;
                if (conn.to === current.id) neighborId = conn.from;

                if (neighborId && !visited.has(neighborId)) {
                    const neighbor = placedDevices.find(d => d.id === neighborId);
                    if (neighbor) queue.push([...path, neighbor]);
                }
            }
        }

        return [];
    }

    function animatePacketAlongPath(canvas, path, packetIndex) {
        const packet = document.createElement('div');
        packet.className = 'data-packet';
        packet.style.left = `${path[0].x - 6}px`;
        packet.style.top = `${path[0].y - 6}px`;

        const colors = ['#f59e0b', '#22c55e', '#0ea5e9'];
        packet.style.background = colors[packetIndex % colors.length];
        packet.style.color = colors[packetIndex % colors.length];

        canvas.appendChild(packet);

        let currentStep = 0;
        const stepDuration = 400;

        function moveToNext() {
            currentStep++;
            if (currentStep >= path.length) {
                packet.remove();
                return;
            }

            const target = path[currentStep];
            packet.style.transition = `all ${stepDuration}ms ease-in-out`;
            packet.style.left = `${target.x - 6}px`;
            packet.style.top = `${target.y - 6}px`;

            setTimeout(moveToNext, stepDuration);
        }

        setTimeout(moveToNext, 100);
    }

    function simpleDataAnimation() {
        const pc = placedDevices.find(d => d.type === 'pc');
        const server = placedDevices.find(d => d.type === 'server');

        if (pc && server) {
            const canvas = document.getElementById('canvas-area');
            const packet = document.createElement('div');
            packet.className = 'data-packet';
            packet.style.left = `${pc.x - 6}px`;
            packet.style.top = `${pc.y - 6}px`;
            packet.style.background = '#22c55e';
            packet.style.color = '#22c55e';
            canvas.appendChild(packet);

            setTimeout(() => {
                packet.style.transition = 'all 1.5s ease-in-out';
                packet.style.left = `${server.x - 6}px`;
                packet.style.top = `${server.y - 6}px`;
            }, 100);

            setTimeout(() => packet.remove(), 2000);
        }
    }

    // ============================================
    // PUBLIC API
    // ============================================

    return {
        init,
        getLevelCount: () => levels.length
    };
})();
