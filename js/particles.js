/**
 * INFORMATIKA LAB ADVENTURE
 * Particles & Visual Effects System
 * Juicy game-feel effects: confetti, sparkles, floating particles
 */

const Particles = (() => {
    let canvas = null;
    let ctx = null;
    let particles = [];
    let animId = null;
    let isRunning = false;

    // ============================================
    // CANVAS SETUP
    // ============================================

    function ensureCanvas() {
        if (canvas) return;
        canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9997;';
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
    }

    function resize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // ============================================
    // PARTICLE TYPES
    // ============================================

    function createParticle(x, y, options = {}) {
        return {
            x, y,
            vx: options.vx || (Math.random() - 0.5) * 10,
            vy: options.vy || (Math.random() - 0.5) * 10,
            size: options.size || 4 + Math.random() * 6,
            color: options.color || '#facc15',
            alpha: 1,
            decay: options.decay || 0.015 + Math.random() * 0.01,
            gravity: options.gravity || 0.15,
            shape: options.shape || (Math.random() > 0.5 ? 'circle' : 'rect'),
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            life: 1
        };
    }

    // ============================================
    // EFFECTS
    // ============================================

    function confetti(x, y, count = 50) {
        if (localStorage.getItem('particles') === 'false') return;
        ensureCanvas();

        const colors = ['#facc15', '#0ea5e9', '#22c55e', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 4 + Math.random() * 8;
            particles.push(createParticle(x, y, {
                vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
                vy: Math.sin(angle) * speed - Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 3 + Math.random() * 8,
                decay: 0.01 + Math.random() * 0.008,
                gravity: 0.12
            }));
        }
        startLoop();
    }

    function sparkle(x, y, count = 20) {
        if (localStorage.getItem('particles') === 'false') return;
        ensureCanvas();

        const colors = ['#facc15', '#fef08a', '#fde047', '#ffffff'];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 2 + Math.random() * 4;
            particles.push(createParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 2 + Math.random() * 4,
                decay: 0.02 + Math.random() * 0.02,
                gravity: 0,
                shape: 'circle'
            }));
        }
        startLoop();
    }

    function burst(x, y, color = '#0ea5e9', count = 15) {
        if (localStorage.getItem('particles') === 'false') return;
        ensureCanvas();

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 3 + Math.random() * 5;
            particles.push(createParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: 3 + Math.random() * 5,
                decay: 0.02,
                gravity: 0.08
            }));
        }
        startLoop();
    }

    function starBurst(x, y) {
        if (localStorage.getItem('particles') === 'false') return;
        ensureCanvas();

        const starColors = ['#facc15', '#f59e0b', '#fbbf24'];
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 / 30) * i;
            const speed = 2 + Math.random() * 6;
            particles.push(createParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                color: starColors[Math.floor(Math.random() * starColors.length)],
                size: 4 + Math.random() * 6,
                decay: 0.015,
                gravity: 0.05,
                shape: 'circle'
            }));
        }
        startLoop();
    }

    function celebrationRain(duration = 2000) {
        if (localStorage.getItem('particles') === 'false') return;
        ensureCanvas();

        const colors = ['#facc15', '#0ea5e9', '#22c55e', '#8b5cf6', '#ec4899'];
        const interval = setInterval(() => {
            for (let i = 0; i < 3; i++) {
                particles.push(createParticle(
                    Math.random() * canvas.width,
                    -10,
                    {
                        vx: (Math.random() - 0.5) * 3,
                        vy: 2 + Math.random() * 3,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        size: 4 + Math.random() * 6,
                        decay: 0.005,
                        gravity: 0.05
                    }
                ));
            }
            startLoop();
        }, 50);

        setTimeout(() => clearInterval(interval), duration);
    }

    // ============================================
    // RENDER LOOP
    // ============================================

    function startLoop() {
        if (isRunning) return;
        isRunning = true;
        loop();
    }

    function loop() {
        if (!ctx || particles.length === 0) {
            isRunning = false;
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            // Update
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.98;
            p.alpha -= p.decay;
            p.rotation += p.rotationSpeed;
            p.life = p.alpha;

            // Remove dead particles
            if (p.alpha <= 0 || p.y > canvas.height + 50) {
                particles.splice(i, 1);
                continue;
            }

            // Draw
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;

            if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }

            ctx.restore();
        }

        animId = requestAnimationFrame(loop);
    }

    // ============================================
    // SCREEN-CENTERED HELPERS
    // ============================================

    function screenCenter() {
        return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }

    function celebrateCenter(count = 80) {
        const { x, y } = screenCenter();
        confetti(x, y, count);
    }

    function sparkleAt(element) {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    return {
        confetti,
        sparkle,
        burst,
        starBurst,
        celebrationRain,
        celebrateCenter,
        sparkleAt
    };
})();
