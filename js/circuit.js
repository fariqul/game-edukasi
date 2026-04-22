/**
 * INFORMATIKA LAB ADVENTURE
 * Mode 5: Circuit Builder — Interactive Electronics Simulator
 * Konsep: Rangkaian Elektronik, Komponen, Arus Listrik, Logika Digital
 * Inspired by withdiode.com
 */

const CircuitGame = (() => {
    // ============================================
    // CONSTANTS
    // ============================================
    const GRID_SIZE = 40;
    const COMPONENT_TYPES = {
        battery: {
            name: 'Baterai',
            icon: 'battery',
            color: '#22c55e',
            desc: 'Sumber tegangan listrik. Arus mengalir dari kutub + ke kutub −.',
            pins: [{ x: 0, y: 0.5, label: '+' }, { x: 1, y: 0.5, label: '−' }],
            voltage: 5,
            w: 3, h: 2
        },
        resistor: {
            name: 'Resistor',
            icon: 'resistor',
            color: '#f59e0b',
            desc: 'Menahan arus listrik. Semakin besar nilai Ohm, semakin kecil arus.',
            pins: [{ x: 0, y: 0.5, label: 'A' }, { x: 1, y: 0.5, label: 'B' }],
            resistance: 100,
            w: 3, h: 2
        },
        led: {
            name: 'LED',
            icon: 'led',
            color: '#ef4444',
            desc: 'Lampu yang menyala saat dialiri arus listrik searah.',
            pins: [{ x: 0, y: 0.5, label: '+' }, { x: 1, y: 0.5, label: '−' }],
            w: 2, h: 2
        },
        switch_open: {
            name: 'Switch',
            icon: 'switch',
            color: '#8b5cf6',
            desc: 'Saklar ON/OFF. Klik untuk menghidupkan/mematikan rangkaian.',
            pins: [{ x: 0, y: 0.5, label: 'A' }, { x: 1, y: 0.5, label: 'B' }],
            toggleable: true,
            w: 2, h: 2
        },
        buzzer: {
            name: 'Buzzer',
            icon: 'buzzer',
            color: '#06b6d4',
            desc: 'Menghasilkan bunyi saat dialiri arus listrik.',
            pins: [{ x: 0, y: 0.5, label: '+' }, { x: 1, y: 0.5, label: '−' }],
            w: 2, h: 2
        },
        capacitor: {
            name: 'Kapasitor',
            icon: 'capacitor',
            color: '#3b82f6',
            desc: 'Menyimpan muatan listrik sementara.',
            pins: [{ x: 0, y: 0.5, label: '+' }, { x: 1, y: 0.5, label: '−' }],
            w: 2, h: 2
        },
        junction: {
            name: 'Junction',
            icon: 'junction',
            color: '#64748b',
            desc: 'Titik percabangan kabel.',
            pins: [
                { x: 0, y: 0.5, label: 'L' },
                { x: 1, y: 0.5, label: 'R' },
                { x: 0.5, y: 0, label: 'T' },
                { x: 0.5, y: 1, label: 'B' }
            ],
            w: 1, h: 1
        }
    };

    // ============================================
    // LEVEL DATA — 3 LEVELS
    // ============================================
    const levels = [
        {
            id: 1,
            mission: 'Level 1: Rangkaian Seri Hint',
            hint: 'Hubungkan Baterai → Switch → LED secara berurutan (seri) membentuk loop tertutup!',
            concept: 'Rangkaian Seri — Komponen dihubungkan berurutan',
            description: 'Rangkaian seri: semua komponen terhubung dalam satu jalur. Arus yang mengalir sama di setiap komponen.',
            availableComponents: ['battery', 'switch_open', 'led'],
            target: {
                // Validation: must form a closed loop: battery+ → switch → LED → battery−
                requiredComponents: ['battery', 'switch_open', 'led'],
                validateFn: 'validateSeriesCircuit'
            },
            preplacedComponents: [],
            boardWidth: 14,
            boardHeight: 10
        },
        {
            id: 2,
            mission: 'Level 2: Rangkaian dengan Resistor Komponen',
            hint: 'LED membutuhkan Resistor agar tidak terbakar! Hubungkan: Baterai → Resistor → LED (seri).',
            concept: 'Resistor melindungi LED dari arus berlebih',
            description: 'Resistor membatasi arus agar LED tidak rusak. Hukum Ohm: V = I X R.',
            availableComponents: ['battery', 'resistor', 'led', 'switch_open'],
            target: {
                requiredComponents: ['battery', 'resistor', 'led'],
                validateFn: 'validateResistorCircuit'
            },
            preplacedComponents: [],
            boardWidth: 16,
            boardHeight: 10
        },
        {
            id: 3,
            mission: 'Level 3: Rangkaian Paralel Percabangan',
            hint: 'Dua LED dihubungkan secara paralel. Gunakan Junction untuk memecah dan menggabungkan kabel!',
            concept: 'Rangkaian Paralel — Komponen memiliki jalur masing-masing',
            description: 'Rangkaian paralel: setiap komponen memiliki jalur sendiri. Tegangan sama, arus terbagi.',
            availableComponents: ['battery', 'led', 'led', 'junction', 'junction', 'switch_open'],
            target: {
                requiredComponents: ['battery', 'led', 'led'],
                validateFn: 'validateParallelCircuit'
            },
            preplacedComponents: [],
            boardWidth: 18,
            boardHeight: 12
        }
    ];

    // ============================================
    // STATE
    // ============================================
    let currentLevel = null;
    let canvas = null;
    let ctx = null;
    let components = [];    // Placed on board: { id, type, x, y, state, pins[] }
    let wires = [];         // { id, from: {compId, pinIdx}, to: {compId, pinIdx}, points[] }
    let nextId = 1;
    let dragState = null;   // { type, compType } or null
    let wireMode = false;
    let wireStart = null;   // { compId, pinIdx, x, y }
    let mousePos = { x: 0, y: 0 };
    let isSimulating = false;
    let simulationParticles = [];
    let animationFrame = null;
    let hintsUsed = 0;
    let startTime = 0;
    let hoveredPin = null;
    let selectedComponent = null;
    let panOffset = { x: 0, y: 0 };
    let boardWidth = 14;
    let boardHeight = 10;

    // ============================================
    // INITIALIZATION
    // ============================================
    function init(levelNum) {
        currentLevel = levels[levelNum - 1] || levels[0];
        components = [];
        wires = [];
        nextId = 1;
        dragState = null;
        wireMode = false;
        wireStart = null;
        isSimulating = false;
        simulationParticles = [];
        hintsUsed = 0;
        selectedComponent = null;
        startTime = Date.now();
        boardWidth = currentLevel.boardWidth || 14;
        boardHeight = currentLevel.boardHeight || 10;

        // Update UI
        const levelEl = document.getElementById('circuit-level');
        if (levelEl) levelEl.textContent = levelNum;
        const missionEl = document.getElementById('circuit-mission');
        if (missionEl) missionEl.textContent = currentLevel.mission;
        const hintEl = document.getElementById('circuit-hint');
        if (hintEl) hintEl.textContent = currentLevel.hint;
        const conceptEl = document.getElementById('circuit-concept');
        if (conceptEl) conceptEl.textContent = currentLevel.concept;
        const descEl = document.getElementById('circuit-description');
        if (descEl) descEl.textContent = currentLevel.description;

        hideFeedback('circuit-feedback');

        // Setup canvas
        setupCanvas();
        renderComponentPalette();
        setupEventListeners();
        setupControls();
        updateControlButtons();

        // Pre-place components if any
        currentLevel.preplacedComponents.forEach(pc => {
            placeComponent(pc.type, pc.x, pc.y);
        });

        // Animate entrance
        animateEntrance();

        // Start render loop
        startRenderLoop();
    }

    // ============================================
    // CANVAS SETUP
    // ============================================
    function setupCanvas() {
        canvas = document.getElementById('circuit-canvas');
        if (!canvas) return;

        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();

        // Responsive canvas size
        const canvasW = Math.max(boardWidth * GRID_SIZE + 40, rect.width - 20);
        const canvasH = Math.max(boardHeight * GRID_SIZE + 40, 400);
        canvas.width = canvasW;
        canvas.height = canvasH;
        canvas.style.width = canvasW + 'px';
        canvas.style.height = canvasH + 'px';

        ctx = canvas.getContext('2d');
        panOffset = {
            x: Math.floor((canvasW - boardWidth * GRID_SIZE) / 2),
            y: Math.floor((canvasH - boardHeight * GRID_SIZE) / 2)
        };
    }

    // ============================================
    // RENDER LOOP
    // ============================================
    function startRenderLoop() {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        function loop() {
            render();
            animationFrame = requestAnimationFrame(loop);
        }
        animationFrame = requestAnimationFrame(loop);
    }

    function stopRenderLoop() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    function render() {
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Background — PCB green
        ctx.fillStyle = '#0a2a1a';
        ctx.fillRect(0, 0, w, h);

        // Draw grid
        drawGrid();

        // Draw wires
        wires.forEach(wire => drawWire(wire));

        // Draw wire-in-progress
        if (wireMode && wireStart) {
            drawWireInProgress();
        }

        // Draw components
        components.forEach(comp => drawComponent(comp));

        // Draw simulation particles
        if (isSimulating) {
            updateAndDrawParticles();
        }

        // Draw hovered pin indicator
        if (hoveredPin && !dragState) {
            drawPinHighlight(hoveredPin);
        }
    }

    // ============================================
    // DRAWING
    // ============================================
    function drawGrid() {
        const ox = panOffset.x;
        const oy = panOffset.y;
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
        ctx.lineWidth = 0.5;

        for (let x = 0; x <= boardWidth; x++) {
            ctx.beginPath();
            ctx.moveTo(ox + x * GRID_SIZE, oy);
            ctx.lineTo(ox + x * GRID_SIZE, oy + boardHeight * GRID_SIZE);
            ctx.stroke();
        }
        for (let y = 0; y <= boardHeight; y++) {
            ctx.beginPath();
            ctx.moveTo(ox, oy + y * GRID_SIZE);
            ctx.lineTo(ox + boardWidth * GRID_SIZE, oy + y * GRID_SIZE);
            ctx.stroke();
        }

        // Board border
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
        ctx.lineWidth = 2;
        ctx.strokeRect(ox, oy, boardWidth * GRID_SIZE, boardHeight * GRID_SIZE);

        // Corner dots
        ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        for (let x = 0; x <= boardWidth; x++) {
            for (let y = 0; y <= boardHeight; y++) {
                ctx.beginPath();
                ctx.arc(ox + x * GRID_SIZE, oy + y * GRID_SIZE, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    function drawComponent(comp) {
        const type = COMPONENT_TYPES[comp.type];
        if (!type) return;

        const ox = panOffset.x;
        const oy = panOffset.y;
        const x = ox + comp.x * GRID_SIZE;
        const y = oy + comp.y * GRID_SIZE;
        const w = (type.w || 2) * GRID_SIZE;
        const h = (type.h || 2) * GRID_SIZE;

        // Shadow
        ctx.shadowColor = type.color + '40';
        ctx.shadowBlur = 12;

        // Body
        const isSelected = selectedComponent === comp.id;
        ctx.fillStyle = isSelected ? type.color + '40' : '#1e293b';
        ctx.strokeStyle = isSelected ? type.color : type.color + '80';
        ctx.lineWidth = isSelected ? 3 : 2;

        roundRect(ctx, x + 2, y + 2, w - 4, h - 4, 8);
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Component-specific drawing
        drawComponentDetails(comp, x, y, w, h, type);

        // Pins
        drawPins(comp, x, y, w, h, type);

        // Lit state for LED
        if (comp.type === 'led' && comp.state === 'on') {
            ctx.fillStyle = '#ef444480';
            ctx.beginPath();
            ctx.arc(x + w / 2, y + h / 2, w / 2 + 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Switch line
        if (comp.type === 'switch_open') {
            const closed = comp.state === 'closed';
            ctx.strokeStyle = closed ? '#22c55e' : '#8b5cf6';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + 10, y + h / 2);
            if (closed) {
                ctx.lineTo(x + w - 10, y + h / 2);
            } else {
                ctx.lineTo(x + w - 15, y + h / 2 - 15);
            }
            ctx.stroke();
        }
    }

    function drawComponentDetails(comp, x, y, w, h, type) {
        drawComponentGlyph(type.icon, x + w / 2, y + h / 2 - 8, Math.min(w, h) * 0.35, '#e2e8f0');

        // Name
        ctx.font = 'bold 10px Nunito, sans-serif';
        ctx.fillStyle = type.color;
        ctx.fillText(type.name, x + w / 2, y + h - 10);

        // Battery polarity labels
        if (comp.type === 'battery') {
            ctx.font = 'bold 14px monospace';
            ctx.fillStyle = '#22c55e';
            ctx.textAlign = 'left';
            ctx.fillText('+', x + 6, y + h / 2 + 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ef4444';
            ctx.fillText('−', x + w - 6, y + h / 2 + 2);
            ctx.textAlign = 'center';
        }

        // Resistor value
        if (comp.type === 'resistor') {
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('100Ω', x + w / 2, y + h - 4);
        }
    }

    function drawComponentGlyph(icon, cx, cy, size, color) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        switch (icon) {
            case 'battery':
                ctx.beginPath();
                ctx.moveTo(-size * 0.45, -size * 0.55);
                ctx.lineTo(-size * 0.45, size * 0.55);
                ctx.moveTo(0, -size * 0.35);
                ctx.lineTo(0, size * 0.35);
                ctx.moveTo(size * 0.4, -size * 0.2);
                ctx.lineTo(size * 0.4, size * 0.2);
                ctx.stroke();
                break;
            case 'resistor':
                ctx.beginPath();
                ctx.moveTo(-size * 0.8, 0);
                ctx.lineTo(-size * 0.45, 0);
                ctx.lineTo(-size * 0.28, -size * 0.35);
                ctx.lineTo(-size * 0.1, size * 0.35);
                ctx.lineTo(size * 0.1, -size * 0.35);
                ctx.lineTo(size * 0.28, size * 0.35);
                ctx.lineTo(size * 0.45, 0);
                ctx.lineTo(size * 0.8, 0);
                ctx.stroke();
                break;
            case 'led':
                ctx.strokeRect(-size * 0.45, -size * 0.35, size * 0.9, size * 0.7);
                ctx.beginPath();
                ctx.moveTo(size * 0.2, -size * 0.75);
                ctx.lineTo(size * 0.45, -size);
                ctx.moveTo(-size * 0.15, -size * 0.75);
                ctx.lineTo(size * 0.1, -size);
                ctx.stroke();
                break;
            case 'switch':
                ctx.beginPath();
                ctx.arc(-size * 0.65, 0, size * 0.14, 0, Math.PI * 2);
                ctx.arc(size * 0.65, 0, size * 0.14, 0, Math.PI * 2);
                ctx.moveTo(-size * 0.5, 0);
                ctx.lineTo(size * 0.35, -size * 0.28);
                ctx.stroke();
                break;
            case 'buzzer':
                ctx.beginPath();
                ctx.moveTo(-size * 0.75, -size * 0.3);
                ctx.lineTo(-size * 0.4, -size * 0.3);
                ctx.lineTo(size * 0.05, -size * 0.55);
                ctx.lineTo(size * 0.05, size * 0.55);
                ctx.lineTo(-size * 0.4, size * 0.3);
                ctx.lineTo(-size * 0.75, size * 0.3);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(size * 0.22, 0, size * 0.24, -0.8, 0.8);
                ctx.arc(size * 0.36, 0, size * 0.4, -0.8, 0.8);
                ctx.stroke();
                break;
            case 'capacitor':
                ctx.beginPath();
                ctx.moveTo(-size * 0.8, 0);
                ctx.lineTo(-size * 0.2, 0);
                ctx.moveTo(size * 0.2, 0);
                ctx.lineTo(size * 0.8, 0);
                ctx.moveTo(-size * 0.15, -size * 0.5);
                ctx.lineTo(-size * 0.15, size * 0.5);
                ctx.moveTo(size * 0.15, -size * 0.5);
                ctx.lineTo(size * 0.15, size * 0.5);
                ctx.stroke();
                break;
            case 'junction':
            default:
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(-size * 0.7, 0);
                ctx.lineTo(-size * 0.2, 0);
                ctx.moveTo(size * 0.2, 0);
                ctx.lineTo(size * 0.7, 0);
                ctx.moveTo(0, -size * 0.7);
                ctx.lineTo(0, -size * 0.2);
                ctx.moveTo(0, size * 0.2);
                ctx.lineTo(0, size * 0.7);
                ctx.stroke();
                break;
        }

        ctx.restore();
    }

    function drawPins(comp, cx, cy, cw, ch, type) {
        type.pins.forEach((pin, idx) => {
            const px = cx + pin.x * cw;
            const py = cy + pin.y * ch;

            // Pin connection point
            const isConnected = isPinConnected(comp.id, idx);
            ctx.fillStyle = isConnected ? '#22c55e' : type.color;
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();

            // Pin border
            ctx.strokeStyle = '#ffffff40';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.stroke();
        });
    }

    function drawPinHighlight(pinInfo) {
        const { x, y } = getPinWorldPos(pinInfo.compId, pinInfo.pinIdx);
        if (x === null) return;

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Pulse effect
        const pulse = (Date.now() % 1000) / 1000;
        ctx.strokeStyle = `rgba(250, 204, 21, ${0.5 - pulse * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 10 + pulse * 8, 0, Math.PI * 2);
        ctx.stroke();
    }

    function drawWire(wire) {
        if (wire.points.length < 2) return;

        const isActive = isSimulating && wire.active;

        ctx.strokeStyle = isActive ? '#22c55e' : '#4ade80';
        ctx.lineWidth = isActive ? 3 : 2;
        ctx.shadowColor = isActive ? '#22c55e80' : 'transparent';
        ctx.shadowBlur = isActive ? 8 : 0;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(wire.points[0].x, wire.points[0].y);
        for (let i = 1; i < wire.points.length; i++) {
            ctx.lineTo(wire.points[i].x, wire.points[i].y);
        }
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Draw endpoints
        wire.points.forEach((pt, i) => {
            if (i === 0 || i === wire.points.length - 1) {
                ctx.fillStyle = isActive ? '#22c55e' : '#4ade80';
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    function drawWireInProgress() {
        if (!wireStart) return;
        const startPos = getPinWorldPos(wireStart.compId, wireStart.pinIdx);
        if (startPos.x === null) return;

        ctx.strokeStyle = '#facc1580';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Start dot
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    // ============================================
    // SIMULATION PARTICLES
    // ============================================
    function updateAndDrawParticles() {
        // Generate particles for active wires
        if (Math.random() < 0.3) {
            wires.forEach(wire => {
                if (wire.active && wire.points.length >= 2) {
                    simulationParticles.push({
                        wireId: wire.id,
                        progress: 0,
                        speed: 0.008 + Math.random() * 0.005,
                        points: wire.points
                    });
                }
            });
        }

        // Update and draw
        simulationParticles = simulationParticles.filter(p => {
            p.progress += p.speed;
            if (p.progress >= 1) return false;

            // Interpolate position along wire
            const pos = interpolateWire(p.points, p.progress);
            if (!pos) return false;

            // Draw particle
            ctx.fillStyle = `rgba(250, 204, 21, ${1 - p.progress})`;
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            return true;
        });

        // Limit particles
        if (simulationParticles.length > 100) {
            simulationParticles = simulationParticles.slice(-60);
        }
    }

    function interpolateWire(points, t) {
        if (points.length < 2) return null;

        // Calculate total length
        let totalLen = 0;
        const segments = [];
        for (let i = 0; i < points.length - 1; i++) {
            const dx = points[i + 1].x - points[i].x;
            const dy = points[i + 1].y - points[i].y;
            const len = Math.sqrt(dx * dx + dy * dy);
            segments.push(len);
            totalLen += len;
        }

        const targetDist = t * totalLen;
        let accum = 0;
        for (let i = 0; i < segments.length; i++) {
            if (accum + segments[i] >= targetDist) {
                const segT = (targetDist - accum) / segments[i];
                return {
                    x: points[i].x + (points[i + 1].x - points[i].x) * segT,
                    y: points[i].y + (points[i + 1].y - points[i].y) * segT
                };
            }
            accum += segments[i];
        }
        return points[points.length - 1];
    }

    // ============================================
    // COMPONENT PALETTE
    // ============================================
    function componentIconSvg(icon, size = 18) {
        const s = size;
        const icons = {
            battery: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6v12M14 8v8M18 10v4"/><path d="M4 12h3"/></svg>`,
            resistor: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h3l2-3 2 6 2-6 2 6 2-3h3"/></svg>`,
            led: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7h10v7H7z"/><path d="M12 14v4m-3 0h6"/><path d="m15 4 2-2m-5 2 2-2"/></svg>`,
            switch: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="12" r="2"/><circle cx="18" cy="12" r="2"/><path d="M8 12h6"/></svg>`,
            buzzer: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h4l4-3v10l-4-3H4z"/><path d="M16 9c1.5 1 1.5 5 0 6m2-8c3 2 3 8 0 10"/></svg>`,
            capacitor: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 12h5m2 0h5M11 7v10m2-10v10"/></svg>`,
            junction: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/><path d="M12 4v6M12 14v6M4 12h6M14 12h6"/></svg>`
        };
        return icons[icon] || icons.junction;
    }

    function renderComponentPalette() {
        const palette = document.getElementById('circuit-palette');
        if (!palette) return;

        palette.innerHTML = '<h4 class="font-display font-bold text-dark-100 mb-3 text-sm">Simulasi Komponen</h4>';

        // Count occurrences in available pool
        const pool = {};
        currentLevel.availableComponents.forEach(t => {
            pool[t] = (pool[t] || 0) + 1;
        });

        // Count already placed
        const placed = {};
        components.forEach(c => {
            placed[c.type] = (placed[c.type] || 0) + 1;
        });

        Object.entries(pool).forEach(([compType, count]) => {
            const type = COMPONENT_TYPES[compType];
            if (!type) return;
            const remaining = count - (placed[compType] || 0);

            const item = document.createElement('div');
            item.className = `circuit-palette-item ${remaining <= 0 ? 'used' : ''}`;
            item.draggable = remaining > 0;
            item.dataset.componentType = compType;
            item.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="text-lg text-slate-200">${componentIconSvg(type.icon)}</span>
                    <div class="flex-1 min-w-0">
                        <span class="font-medium text-xs block text-white">${type.name}</span>
                        <span class="text-[10px] text-dark-300">${remaining > 0 ? `X${remaining}` : 'Sudah dipakai'}</span>
                    </div>
                </div>
                <div class="circuit-palette-tooltip">
                    <span class="font-bold text-xs" style="color:${type.color}">${type.name}</span>
                    <p class="text-[10px] mt-1 text-dark-200">${type.desc}</p>
                </div>
            `;
            palette.appendChild(item);
        });
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    function setupEventListeners() {
        if (!canvas) return;

        // Remove old listeners
        canvas.removeEventListener('mousedown', onCanvasMouseDown);
        canvas.removeEventListener('mousemove', onCanvasMouseMove);
        canvas.removeEventListener('mouseup', onCanvasMouseUp);
        canvas.removeEventListener('dblclick', onCanvasDoubleClick);
        canvas.removeEventListener('contextmenu', onContextMenu);

        canvas.addEventListener('mousedown', onCanvasMouseDown);
        canvas.addEventListener('mousemove', onCanvasMouseMove);
        canvas.addEventListener('mouseup', onCanvasMouseUp);
        canvas.addEventListener('dblclick', onCanvasDoubleClick);
        canvas.addEventListener('contextmenu', onContextMenu);

        // Palette drag
        const palette = document.getElementById('circuit-palette');
        if (palette) {
            palette.removeEventListener('dragstart', onPaletteDragStart);
            palette.addEventListener('dragstart', onPaletteDragStart);
        }

        canvas.removeEventListener('dragover', onCanvasDragOver);
        canvas.removeEventListener('drop', onCanvasDrop);
        canvas.addEventListener('dragover', onCanvasDragOver);
        canvas.addEventListener('drop', onCanvasDrop);

        // Touch support
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchend', onTouchEnd);
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    }

    function onPaletteDragStart(e) {
        const item = e.target.closest('.circuit-palette-item');
        if (!item || item.classList.contains('used')) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text/plain', item.dataset.componentType);
        dragState = { type: 'palette', compType: item.dataset.componentType };
    }

    function onCanvasDragOver(e) {
        e.preventDefault();
    }

    function onCanvasDrop(e) {
        e.preventDefault();
        if (!dragState || dragState.type !== 'palette') return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Snap to grid
        const gx = Math.round((x - panOffset.x) / GRID_SIZE);
        const gy = Math.round((y - panOffset.y) / GRID_SIZE);

        const type = COMPONENT_TYPES[dragState.compType];
        if (type && isValidPlacement(dragState.compType, gx, gy)) {
            placeComponent(dragState.compType, gx, gy);
            if (typeof SoundManager !== 'undefined') SoundManager.play('place');
            renderComponentPalette();
        }

        dragState = null;
    }

    function onCanvasMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Check pin click for wiring
        const pin = findPinAt(mx, my);
        if (pin) {
            if (!wireMode) {
                // Start wire
                wireMode = true;
                wireStart = pin;
                updateControlButtons();
                return;
            } else if (wireStart) {
                // Complete wire
                if (pin.compId !== wireStart.compId || pin.pinIdx !== wireStart.pinIdx) {
                    createWire(wireStart, pin);
                }
                wireMode = false;
                wireStart = null;
                updateControlButtons();
                return;
            }
        }

        // Check component click (for selection / toggle)
        const comp = findComponentAt(mx, my);
        if (comp) {
            if (wireMode) {
                // Cancel wire mode on component body click
                wireMode = false;
                wireStart = null;
                updateControlButtons();
            }
            selectedComponent = comp.id;

            // Toggle switch on click
            if (comp.type === 'switch_open') {
                comp.state = comp.state === 'closed' ? 'open' : 'closed';
                if (typeof SoundManager !== 'undefined') SoundManager.play('click');
                if (isSimulating) {
                    runSimulation();
                }
            }
            return;
        }

        // Click empty space — deselect / cancel wire
        if (wireMode) {
            wireMode = false;
            wireStart = null;
            updateControlButtons();
        }
        selectedComponent = null;
    }

    function onCanvasMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;

        // Update hovered pin
        hoveredPin = findPinAt(mousePos.x, mousePos.y);

        // Update cursor
        if (hoveredPin) {
            canvas.style.cursor = wireMode ? 'crosshair' : 'pointer';
        } else if (findComponentAt(mousePos.x, mousePos.y)) {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = wireMode ? 'crosshair' : 'default';
        }
    }

    function onCanvasMouseUp(e) {
        // No-op for now (drag handled by HTML5 drag API)
    }

    function onCanvasDoubleClick(e) {
        // Delete selected component
        if (selectedComponent !== null) {
            removeComponent(selectedComponent);
            selectedComponent = null;
            renderComponentPalette();
        }
    }

    function onContextMenu(e) {
        e.preventDefault();
        // Delete wire at mouse position
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const wireIdx = findWireAt(mx, my);
        if (wireIdx >= 0) {
            wires.splice(wireIdx, 1);
            if (typeof SoundManager !== 'undefined') SoundManager.play('remove');
        }
    }

    // Touch support
    function onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => { } };
        onCanvasMouseDown(fakeEvent);
    }

    function onTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
        onCanvasMouseMove(fakeEvent);
    }

    function onTouchEnd(e) {
        e.preventDefault();
    }

    // ============================================
    // COMPONENT MANAGEMENT
    // ============================================
    function placeComponent(type, gx, gy) {
        const compType = COMPONENT_TYPES[type];
        if (!compType) return null;

        const comp = {
            id: nextId++,
            type: type,
            x: gx,
            y: gy,
            state: type === 'switch_open' ? 'open' : 'off',
            powered: false
        };

        components.push(comp);

        // Animate
        if (typeof anime !== 'undefined') {
            const tempScale = { v: 0 };
            anime({
                targets: tempScale,
                v: 1,
                duration: 400,
                easing: 'easeOutElastic(1, .5)'
            });
        }

        return comp;
    }

    function removeComponent(compId) {
        // Remove associated wires
        wires = wires.filter(w => w.from.compId !== compId && w.to.compId !== compId);
        // Remove component
        components = components.filter(c => c.id !== compId);
        if (typeof SoundManager !== 'undefined') SoundManager.play('remove');
    }

    function isValidPlacement(type, gx, gy) {
        const compType = COMPONENT_TYPES[type];
        if (!compType) return false;
        const w = compType.w || 2;
        const h = compType.h || 2;

        // Check bounds
        if (gx < 0 || gy < 0 || gx + w > boardWidth || gy + h > boardHeight) return false;

        // Check overlap
        for (const comp of components) {
            const ct = COMPONENT_TYPES[comp.type];
            if (!ct) continue;
            const cw = ct.w || 2;
            const ch = ct.h || 2;
            if (gx < comp.x + cw && gx + w > comp.x && gy < comp.y + ch && gy + h > comp.y) {
                return false;
            }
        }
        return true;
    }

    // ============================================
    // WIRING
    // ============================================
    function createWire(startPin, endPin) {
        const startPos = getPinWorldPos(startPin.compId, startPin.pinIdx);
        const endPos = getPinWorldPos(endPin.compId, endPin.pinIdx);

        if (startPos.x === null || endPos.x === null) return;

        // Check if wire already exists
        const exists = wires.some(w =>
            (w.from.compId === startPin.compId && w.from.pinIdx === startPin.pinIdx &&
                w.to.compId === endPin.compId && w.to.pinIdx === endPin.pinIdx) ||
            (w.from.compId === endPin.compId && w.from.pinIdx === endPin.pinIdx &&
                w.to.compId === startPin.compId && w.to.pinIdx === startPin.pinIdx)
        );
        if (exists) return;

        // Create wire with routed points (L-shaped)
        const points = routeWire(startPos, endPos);

        wires.push({
            id: nextId++,
            from: { compId: startPin.compId, pinIdx: startPin.pinIdx },
            to: { compId: endPin.compId, pinIdx: endPin.pinIdx },
            points: points,
            active: false
        });

        if (typeof SoundManager !== 'undefined') SoundManager.play('connect');
    }

    function routeWire(start, end) {
        // Simple L-shaped routing
        const midX = (start.x + end.x) / 2;
        return [
            { x: start.x, y: start.y },
            { x: midX, y: start.y },
            { x: midX, y: end.y },
            { x: end.x, y: end.y }
        ];
    }

    // ============================================
    // HIT TESTING
    // ============================================
    function findPinAt(mx, my) {
        const threshold = 12;
        for (const comp of components) {
            const type = COMPONENT_TYPES[comp.type];
            if (!type) continue;
            const ox = panOffset.x;
            const oy = panOffset.y;
            const cx = ox + comp.x * GRID_SIZE;
            const cy = oy + comp.y * GRID_SIZE;
            const cw = (type.w || 2) * GRID_SIZE;
            const ch = (type.h || 2) * GRID_SIZE;

            for (let i = 0; i < type.pins.length; i++) {
                const pin = type.pins[i];
                const px = cx + pin.x * cw;
                const py = cy + pin.y * ch;
                const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);
                if (dist < threshold) {
                    return { compId: comp.id, pinIdx: i, x: px, y: py };
                }
            }
        }
        return null;
    }

    function findComponentAt(mx, my) {
        for (const comp of components) {
            const type = COMPONENT_TYPES[comp.type];
            if (!type) continue;
            const ox = panOffset.x;
            const oy = panOffset.y;
            const cx = ox + comp.x * GRID_SIZE;
            const cy = oy + comp.y * GRID_SIZE;
            const cw = (type.w || 2) * GRID_SIZE;
            const ch = (type.h || 2) * GRID_SIZE;

            if (mx >= cx && mx <= cx + cw && my >= cy && my <= cy + ch) {
                return comp;
            }
        }
        return null;
    }

    function findWireAt(mx, my) {
        const threshold = 8;
        for (let wi = 0; wi < wires.length; wi++) {
            const wire = wires[wi];
            for (let i = 0; i < wire.points.length - 1; i++) {
                const dist = distToSegment(mx, my,
                    wire.points[i].x, wire.points[i].y,
                    wire.points[i + 1].x, wire.points[i + 1].y);
                if (dist < threshold) return wi;
            }
        }
        return -1;
    }

    function distToSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
        let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
    }

    function getPinWorldPos(compId, pinIdx) {
        const comp = components.find(c => c.id === compId);
        if (!comp) return { x: null, y: null };
        const type = COMPONENT_TYPES[comp.type];
        if (!type || !type.pins[pinIdx]) return { x: null, y: null };

        const ox = panOffset.x;
        const oy = panOffset.y;
        const cx = ox + comp.x * GRID_SIZE;
        const cy = oy + comp.y * GRID_SIZE;
        const cw = (type.w || 2) * GRID_SIZE;
        const ch = (type.h || 2) * GRID_SIZE;
        const pin = type.pins[pinIdx];

        return { x: cx + pin.x * cw, y: cy + pin.y * ch };
    }

    function isPinConnected(compId, pinIdx) {
        return wires.some(w =>
            (w.from.compId === compId && w.from.pinIdx === pinIdx) ||
            (w.to.compId === compId && w.to.pinIdx === pinIdx)
        );
    }

    // ============================================
    // SIMULATION
    // ============================================
    function runSimulation() {
        isSimulating = true;
        simulationParticles = [];

        // Reset component states
        components.forEach(c => {
            if (c.type !== 'switch_open') c.state = 'off';
            c.powered = false;
        });
        wires.forEach(w => w.active = false);

        // Find batteries
        const batteries = components.filter(c => c.type === 'battery');
        if (batteries.length === 0) {
            showFeedback('circuit-feedback', 'Tidak ada baterai! Tambahkan baterai sebagai sumber listrik.', false);
            isSimulating = false;
            return false;
        }

        // Build adjacency graph
        const graph = buildGraph();

        // For each battery, trace circuits
        let anyCircuitComplete = false;

        batteries.forEach(bat => {
            // Find paths from battery+ (pin 0) back to battery− (pin 1)
            const visited = new Set();
            const path = [];
            if (tracePath(graph, `${bat.id}:0`, `${bat.id}:1`, visited, path)) {
                anyCircuitComplete = true;
                // Mark path as active
                path.forEach(edge => {
                    if (edge.wireId) {
                        const wire = wires.find(w => w.id === edge.wireId);
                        if (wire) wire.active = true;
                    }
                });
                // Power components in path
                path.forEach(edge => {
                    const comp = components.find(c => c.id === edge.compId);
                    if (comp) {
                        comp.powered = true;
                        if (comp.type === 'led') comp.state = 'on';
                        if (comp.type === 'buzzer') comp.state = 'on';
                    }
                });
            }
        });

        if (anyCircuitComplete) {
            showFeedback('circuit-feedback', 'Simulasi Rangkaian terhubung! Arus mengalir.', true);
        } else {
            showFeedback('circuit-feedback', 'Rangkaian tidak lengkap. Periksa koneksi kabel!', false);
        }

        return anyCircuitComplete;
    }

    function buildGraph() {
        // Graph: nodeId -> [{ to: nodeId, wireId, compId }]
        // Node = "compId:pinIdx"
        const graph = {};

        const addEdge = (a, b, wireId, compId) => {
            if (!graph[a]) graph[a] = [];
            if (!graph[b]) graph[b] = [];
            graph[a].push({ to: b, wireId, compId });
            graph[b].push({ to: a, wireId, compId });
        };

        // Wire edges (external connections between pins)
        wires.forEach(w => {
            const fromNode = `${w.from.compId}:${w.from.pinIdx}`;
            const toNode = `${w.to.compId}:${w.to.pinIdx}`;
            addEdge(fromNode, toNode, w.id, null);
        });

        // Internal component edges (pin 0 → pin 1 if component allows)
        components.forEach(comp => {
            const type = COMPONENT_TYPES[comp.type];
            if (!type) return;

            // Switches block current when open
            if (comp.type === 'switch_open' && comp.state !== 'closed') return;

            // Connect all pins internally (simple model)
            if (type.pins.length === 2) {
                addEdge(`${comp.id}:0`, `${comp.id}:1`, null, comp.id);
            } else if (type.pins.length === 4) {
                // Junction: all pins connected
                for (let i = 0; i < type.pins.length; i++) {
                    for (let j = i + 1; j < type.pins.length; j++) {
                        addEdge(`${comp.id}:${i}`, `${comp.id}:${j}`, null, comp.id);
                    }
                }
            }
        });

        return graph;
    }

    function tracePath(graph, start, end, visited, path) {
        if (start === end && path.length > 0) return true;
        visited.add(start);

        const neighbors = graph[start] || [];
        for (const edge of neighbors) {
            if (visited.has(edge.to)) continue;
            path.push(edge);
            if (tracePath(graph, edge.to, end, visited, path)) return true;
            path.pop();
        }

        visited.delete(start);
        return false;
    }

    function findAllPaths(graph, start, end, maxPaths = 120, maxDepth = 40) {
        const paths = [];
        const visited = new Set();

        function dfs(node, pathEdges) {
            if (paths.length >= maxPaths) return;
            if (pathEdges.length > maxDepth) return;
            if (node === end && pathEdges.length > 0) {
                paths.push([...pathEdges]);
                return;
            }

            visited.add(node);
            const neighbors = graph[node] || [];
            for (const edge of neighbors) {
                if (visited.has(edge.to)) continue;
                pathEdges.push(edge);
                dfs(edge.to, pathEdges);
                pathEdges.pop();
                if (paths.length >= maxPaths) break;
            }
            visited.delete(node);
        }

        dfs(start, []);
        return paths;
    }

    // ============================================
    // VALIDATION
    // ============================================
    function validateCircuit() {
        const fn = currentLevel.target.validateFn;
        switch (fn) {
            case 'validateSeriesCircuit': return validateSeriesCircuit();
            case 'validateResistorCircuit': return validateResistorCircuit();
            case 'validateParallelCircuit': return validateParallelCircuit();
            default: return false;
        }
    }

    function validateSeriesCircuit() {
        // Must have: battery, switch (closed), LED — all in a closed loop
        const hasBattery = components.some(c => c.type === 'battery');
        const hasSwitch = components.some(c => c.type === 'switch_open');
        const hasLed = components.some(c => c.type === 'led');

        if (!hasBattery || !hasSwitch || !hasLed) return false;

        // Ensure switch is closed
        const sw = components.find(c => c.type === 'switch_open');
        if (sw && sw.state !== 'closed') {
            showFeedback('circuit-feedback', 'Hint Nyalakan Switch dulu! Alur seri harus Baterai → Switch(ON) → LED.', false);
            return false;
        }

        // Run simulation and check LED is on
        const circuitOk = runSimulation();
        const ledOn = components.some(c => c.type === 'led' && c.state === 'on');
        return circuitOk && ledOn;
    }

    function validateResistorCircuit() {
        const hasBattery = components.some(c => c.type === 'battery');
        const hasResistor = components.some(c => c.type === 'resistor');
        const hasLed = components.some(c => c.type === 'led');

        if (!hasBattery || !hasResistor || !hasLed) return false;

        const circuitOk = runSimulation();
        const ledOn = components.some(c => c.type === 'led' && c.state === 'on');
        if (!circuitOk || !ledOn) return false;

        const battery = components.find(c => c.type === 'battery');
        if (!battery) return false;
        const ledIds = components.filter(c => c.type === 'led').map(c => c.id);
        const resistorIds = components.filter(c => c.type === 'resistor').map(c => c.id);
        const graph = buildGraph();
        const paths = findAllPaths(graph, `${battery.id}:0`, `${battery.id}:1`);
        if (paths.length === 0) return false;

        const rules = typeof CircuitRules !== 'undefined' ? CircuitRules : null;
        if (rules && rules.hasUnsafeLedBypass(paths, ledIds, resistorIds)) {
            showFeedback('circuit-feedback', 'LED masih punya jalur bypass tanpa resistor. Tempatkan resistor di jalur LED.', false);
            return false;
        }

        const hasLedPathWithResistor = paths.some(path => {
            const ids = rules ? rules.pathComponentIds(path) : new Set(path.filter(e => e.compId).map(e => e.compId));
            const containsLed = ledIds.some(id => ids.has(id));
            const containsResistor = resistorIds.some(id => ids.has(id));
            return containsLed && containsResistor;
        });
        if (!hasLedPathWithResistor) {
            showFeedback('circuit-feedback', 'Jalur LED belum melewati resistor.', false);
            return false;
        }

        return true;
    }

    function validateParallelCircuit() {
        const hasBattery = components.some(c => c.type === 'battery');
        const leds = components.filter(c => c.type === 'led');

        if (!hasBattery || leds.length < 2) return false;

        const circuitOk = runSimulation();
        const allLedsOn = leds.every(l => l.state === 'on');
        if (!circuitOk || !allLedsOn) return false;

        const battery = components.find(c => c.type === 'battery');
        if (!battery) return false;
        const graph = buildGraph();
        const paths = findAllPaths(graph, `${battery.id}:0`, `${battery.id}:1`);
        if (paths.length === 0) return false;

        const rules = typeof CircuitRules !== 'undefined' ? CircuitRules : null;
        const ledIds = leds.map(l => l.id);
        const hasParallelBranches = rules
            ? rules.hasDistinctSingleLedPaths(paths, ledIds)
            : ledIds.every(ledId => paths.some(path => path.some(edge => edge.compId === ledId)));
        if (!hasParallelBranches) {
            showFeedback('circuit-feedback', 'Ini belum paralel. Tiap LED harus punya cabang jalur sendiri.', false);
            return false;
        }

        return true;
    }

    // ============================================
    // CONTROLS
    // ============================================
    function setupControls() {
        const controlIds = ['circuit-simulate-btn', 'circuit-reset-btn', 'circuit-wire-btn', 'circuit-delete-btn'];
        controlIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.replaceWith(btn.cloneNode(true));
        });

        // Simulate button
        const simBtn = document.getElementById('circuit-simulate-btn');
        if (simBtn) {
            simBtn.addEventListener('click', () => {
                // Check required components
                const required = currentLevel.target.requiredComponents;
                const placedTypes = components.map(c => c.type);
                const missing = [];
                const tempPlaced = [...placedTypes];
                required.forEach(r => {
                    const idx = tempPlaced.indexOf(r);
                    if (idx >= 0) tempPlaced.splice(idx, 1);
                    else missing.push(COMPONENT_TYPES[r]?.name || r);
                });

                if (missing.length > 0) {
                    showFeedback('circuit-feedback', `Peringatan Komponen belum lengkap: ${missing.join(', ')}`, false);
                    return;
                }

                if (wires.length === 0) {
                    showFeedback('circuit-feedback', 'Peringatan Belum ada kabel! Hubungkan komponen dengan klik pin.', false);
                    return;
                }

                const valid = validateCircuit();
                if (valid) {
                    // Success!
                    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
                    if (typeof SoundManager !== 'undefined') SoundManager.play('success');
                    const conceptNote = currentLevel?.concept
                        ? `<br><span class="text-xs text-dark-200">Konsep ${currentLevel.concept}</span>`
                        : '';
                    showFeedback('circuit-feedback', `Rangkaian valid! Simulasi berhasil.${conceptNote}`, true);

                    setTimeout(() => {
                        completeLevel('circuit', {
                            timeTaken,
                            hintsUsed,
                            errorsOccurred: 0
                        });
                    }, 1000);
                }
            });
        }

        // Reset button
        const resetBtn = document.getElementById('circuit-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                components = [];
                wires = [];
                simulationParticles = [];
                isSimulating = false;
                selectedComponent = null;
                wireMode = false;
                wireStart = null;
                renderComponentPalette();
                updateControlButtons();
                hideFeedback('circuit-feedback');
                if (typeof SoundManager !== 'undefined') SoundManager.play('reset');
                showFeedback('circuit-feedback', 'Papan rangkaian direset.', true);
            });
        }

        // Wire mode toggle
        const wireBtn = document.getElementById('circuit-wire-btn');
        if (wireBtn) {
            wireBtn.addEventListener('click', () => {
                wireMode = !wireMode;
                if (!wireMode) wireStart = null;
                updateControlButtons();
            });
        }

        // Delete selected
        const deleteBtn = document.getElementById('circuit-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (selectedComponent !== null) {
                    removeComponent(selectedComponent);
                    selectedComponent = null;
                    renderComponentPalette();
                    showFeedback('circuit-feedback', 'Komponen terpilih dihapus.', true);
                } else {
                    showFeedback('circuit-feedback', 'Pilih komponen dulu sebelum menghapus.', false);
                }
            });
        }
    }

    function updateControlButtons() {
        const wireBtn = document.getElementById('circuit-wire-btn');
        if (wireBtn) {
            wireBtn.classList.toggle('active', wireMode);
            wireBtn.textContent = wireMode ? 'Mode Kabel (ON)' : 'Kabel';
        }
    }

    // ============================================
    // ANIMATIONS
    // ============================================
    function animateEntrance() {
        if (typeof anime === 'undefined') return;

        anime({
            targets: '#circuit-canvas',
            scale: [0.9, 1],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutElastic(1, .8)'
        });

        anime({
            targets: '.circuit-palette-item',
            translateX: [-30, 0],
            opacity: [0, 1],
            delay: anime.stagger(60, { start: 200 }),
            duration: 400,
            easing: 'easeOutQuart'
        });
    }

    // ============================================
    // HELPERS
    // ============================================
    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    // ============================================
    // PUBLIC API
    // ============================================
    return {
        init,
        getLevels: () => levels,
        getComponents: () => components,
        getWires: () => wires
    };
})();
