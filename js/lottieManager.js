// LottieManager - Lottie animation management module
// Applies: lottie skill (lazy loading, reduced motion, performance)
//          lottie-animator (SVG-to-Lottie workflow, professional easing)
//          lottie-bodymovin (Disney's 12 principles, segment playback)
const LottieManager = (() => {
    'use strict';

    // Animation registry for lifecycle management
    const animations = new Map();
    let animIdCounter = 0;
    let lottieReady = false;
    let pendingQueue = [];

    // ─── Configuration ───────────────────────────────────────
    const LOTTIE_BASE = 'assets/lottie/';

    const ANIMATION_CATALOG = {
        'loading-spinner': { path: 'loading-spinner.json', loop: true, autoplay: true },
        'star-reveal':     { path: 'star-reveal.json',     loop: false, autoplay: false },
        'success-check':   { path: 'success-check.json',   loop: false, autoplay: false },
        'streak-fire':     { path: 'streak-fire.json',     loop: true, autoplay: true },
        'celebration':     { path: 'celebration.json',      loop: false, autoplay: false },
        'rocket-launch':   { path: 'rocket-launch.json',   loop: false, autoplay: false },
        'trophy-pulse':    { path: 'trophy-pulse.json',    loop: true, autoplay: true },
        'network-icon':    { path: 'network-icon.json',    loop: true, autoplay: true },
        'computer-icon':   { path: 'computer-icon.json',   loop: true, autoplay: true },
        'coding-icon':     { path: 'coding-icon.json',     loop: true, autoplay: true },
        // Network device icons
        'device-pc':       { path: 'device-pc.json',       loop: false, autoplay: true },
        'device-switch':   { path: 'device-switch.json',   loop: false, autoplay: true },
        'device-router':   { path: 'device-router.json',   loop: false, autoplay: true },
        'device-server':   { path: 'device-server.json',   loop: false, autoplay: true },
        // Computer component icons
        'comp-cpu':            { path: 'comp-cpu.json',            loop: false, autoplay: true },
        'comp-ram':            { path: 'comp-ram.json',            loop: false, autoplay: true },
        'comp-gpu':            { path: 'comp-gpu.json',            loop: false, autoplay: true },
        'comp-storage':        { path: 'comp-storage.json',        loop: false, autoplay: true },
        'comp-psu':            { path: 'comp-psu.json',            loop: false, autoplay: true },
        'comp-motherboard':    { path: 'comp-motherboard.json',    loop: false, autoplay: true },
        'comp-cooler':         { path: 'comp-cooler.json',         loop: false, autoplay: true },
        'comp-keyboard':       { path: 'comp-keyboard.json',       loop: false, autoplay: true },
        'comp-mouse':          { path: 'comp-mouse.json',          loop: false, autoplay: true },
        'comp-monitor':        { path: 'comp-monitor.json',        loop: false, autoplay: true },
        'comp-case':           { path: 'comp-case.json',           loop: false, autoplay: true },
        'comp-alu':            { path: 'comp-alu.json',            loop: false, autoplay: true },
        'comp-bios-chip':      { path: 'comp-bios-chip.json',      loop: false, autoplay: true },
        'comp-register':       { path: 'comp-register.json',       loop: false, autoplay: true },
        'comp-l1-cache':       { path: 'comp-l1-cache.json',       loop: false, autoplay: true },
        'comp-l2-cache':       { path: 'comp-l2-cache.json',       loop: false, autoplay: true },
        'comp-l3-cache':       { path: 'comp-l3-cache.json',       loop: false, autoplay: true },
        'comp-north-bridge':   { path: 'comp-north-bridge.json',   loop: false, autoplay: true },
        'comp-south-bridge':   { path: 'comp-south-bridge.json',   loop: false, autoplay: true },
        'comp-usb-controller': { path: 'comp-usb-controller.json', loop: false, autoplay: true },
        'comp-os-installer':   { path: 'comp-os-installer.json',   loop: false, autoplay: true },
        // Background & case state animations
        'bg-motherboard':      { path: 'bg-motherboard.json',      loop: true, autoplay: true },
        'bg-pccase':           { path: 'bg-pccase.json',           loop: true, autoplay: true },
        'case-off':            { path: 'case-off.json',            loop: true, autoplay: true },
        'case-on':             { path: 'case-on.json',             loop: true, autoplay: true },
        'case-error':          { path: 'case-error.json',          loop: true, autoplay: true }
    };

    // Disney's 12 Principles applied via speed/direction control (lottie-bodymovin)
    const EASING_PRESETS = {
        // Slow In, Slow Out (Ease In Out)
        anticipation: { speed: 0.8 },
        // Exaggeration  
        exaggerated: { speed: 1.3 },
        // Follow Through & Overlapping Action
        followThrough: { speed: 0.6 },
        // Normal timing
        normal: { speed: 1.0 }
    };

    // ─── Reduced Motion Detection (lottie skill - accessibility) ──
    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Listen for changes in reduced motion preference
    function watchReducedMotion() {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        mq.addEventListener('change', (e) => {
            if (e.matches) {
                // Pause all looping animations, show last frame for one-shots
                animations.forEach((entry) => {
                    if (entry.anim && entry.options.loop) {
                        entry.anim.pause();
                    } else if (entry.anim) {
                        entry.anim.goToAndStop(entry.anim.totalFrames - 1, true);
                    }
                });
            } else {
                // Resume looping animations
                animations.forEach((entry) => {
                    if (entry.anim && entry.options.loop) {
                        entry.anim.play();
                    }
                });
            }
        });
    }

    // ─── Lazy Loading via IntersectionObserver (lottie skill) ─────
    const lazyObserver = typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const animId = el.dataset.lottieId;
                    const registeredEntry = animations.get(animId);
                    if (registeredEntry && !registeredEntry.loaded) {
                        _loadAnimation(animId);
                    }
                    lazyObserver.unobserve(el);
                }
            });
        }, { rootMargin: '100px' })
        : null;

    // ─── Core Methods ────────────────────────────────────────

    /**
     * Create a Lottie animation in a container
     * @param {HTMLElement|string} container - DOM element or selector
     * @param {string} animName - Key from ANIMATION_CATALOG or custom path
     * @param {Object} options - Override options
     * @returns {string} Animation ID for later control
     */
    function create(container, animName, options = {}) {
        const el = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        if (!el) {
            console.warn('[LottieManager] Container not found:', container);
            return null;
        }

        const animId = `lottie_${++animIdCounter}`;
        const catalogEntry = ANIMATION_CATALOG[animName] || {};

        const finalOptions = {
            path: catalogEntry.path ? LOTTIE_BASE + catalogEntry.path : animName,
            loop: catalogEntry.loop !== undefined ? catalogEntry.loop : false,
            autoplay: catalogEntry.autoplay !== undefined ? catalogEntry.autoplay : false,
            renderer: 'svg', // SVG renderer for quality + accessibility (lottie skill)
            ...options
        };

        // Prepare container
        el.dataset.lottieId = animId;
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', options.ariaLabel || animName.replace(/-/g, ' '));

        // Register
        animations.set(animId, {
            container: el,
            options: finalOptions,
            anim: null,
            loaded: false,
            name: animName
        });

        // If reduced motion, show static frame
        if (prefersReducedMotion() && !options.ignoreReducedMotion) {
            finalOptions.autoplay = false;
            // Load but don't play - show last frame
            _loadAnimation(animId, true);
            return animId;
        }

        // Lazy loading for off-screen elements (lottie skill)
        if (options.lazy && lazyObserver) {
            lazyObserver.observe(el);
            return animId;
        }

        // Immediate load
        if (lottieReady) {
            _loadAnimation(animId);
        } else {
            pendingQueue.push(animId);
        }

        return animId;
    }

    /**
     * Internal: Load a Lottie animation
     */
    function _loadAnimation(animId, showLastFrame = false) {
        const entry = animations.get(animId);
        if (!entry || entry.loaded) return;

        if (typeof lottie === 'undefined') {
            console.warn('[LottieManager] lottie-web not loaded yet');
            pendingQueue.push(animId);
            return;
        }

        try {
            const anim = lottie.loadAnimation({
                container: entry.container,
                renderer: entry.options.renderer,
                loop: entry.options.loop,
                autoplay: entry.options.autoplay && !showLastFrame,
                path: entry.options.path,
                rendererSettings: {
                    // Performance optimizations (lottie skill)
                    progressiveLoad: true,
                    preserveAspectRatio: 'xMidYMid meet',
                    clearCanvas: false
                }
            });

            entry.anim = anim;
            entry.loaded = true;

            // Apply speed from Disney principle presets (lottie-bodymovin)
            if (entry.options.easing && EASING_PRESETS[entry.options.easing]) {
                anim.setSpeed(EASING_PRESETS[entry.options.easing].speed);
            }

            if (showLastFrame) {
                anim.addEventListener('DOMLoaded', () => {
                    anim.goToAndStop(anim.totalFrames - 1, true);
                });
            }

            // Event callbacks
            if (entry.options.onComplete) {
                anim.addEventListener('complete', entry.options.onComplete);
            }
            if (entry.options.onLoop) {
                anim.addEventListener('loopComplete', entry.options.onLoop);
            }
            if (entry.options.onLoaded) {
                anim.addEventListener('DOMLoaded', entry.options.onLoaded);
            }
        } catch (err) {
            console.error('[LottieManager] Failed to load:', animId, err);
        }
    }

    /**
     * Play an animation (supports Disney principle: Timing)
     */
    function play(animId, options = {}) {
        const entry = animations.get(animId);
        if (!entry?.anim) return;

        // Anticipation: brief pause before play (lottie-bodymovin)
        if (options.anticipation) {
            entry.anim.setSpeed(0.5);
            entry.anim.play();
            setTimeout(() => {
                entry.anim.setSpeed(options.speed || 1);
            }, 100);
        } else {
            if (options.speed) entry.anim.setSpeed(options.speed);
            entry.anim.goToAndPlay(0, true);
        }
    }

    /**
     * Play a specific segment (lottie-bodymovin: playSegments)
     * Perfect for multi-state animations
     */
    function playSegment(animId, start, end, forceFlag = true) {
        const entry = animations.get(animId);
        if (!entry?.anim) return;
        entry.anim.playSegments([start, end], forceFlag);
    }

    /**
     * Set direction (lottie-bodymovin: setDirection)
     * 1 = forward, -1 = reverse
     */
    function setDirection(animId, direction) {
        const entry = animations.get(animId);
        if (!entry?.anim) return;
        entry.anim.setDirection(direction);
    }

    /**
     * Pause animation
     */
    function pause(animId) {
        const entry = animations.get(animId);
        if (!entry?.anim) return;
        entry.anim.pause();
    }

    /**
     * Stop and reset animation
     */
    function stop(animId) {
        const entry = animations.get(animId);
        if (!entry?.anim) return;
        entry.anim.stop();
    }

    /**
     * Go to specific frame (lottie-bodymovin)
     */
    function goToFrame(animId, frame, isFrame = true) {
        const entry = animations.get(animId);
        if (!entry?.anim) return;
        entry.anim.goToAndStop(frame, isFrame);
    }

    /**
     * Destroy a specific animation and cleanup (lottie skill - memory management)
     */
    function destroy(animId) {
        const entry = animations.get(animId);
        if (!entry) return;

        if (entry.anim) {
            entry.anim.destroy();
        }
        if (entry.container) {
            entry.container.innerHTML = '';
            delete entry.container.dataset.lottieId;
        }
        if (lazyObserver && entry.container) {
            lazyObserver.unobserve(entry.container);
        }
        animations.delete(animId);
    }

    /**
     * Destroy all animations in a container scope (useful for screen transitions)
     */
    function destroyInScope(scopeSelector) {
        const scope = typeof scopeSelector === 'string'
            ? document.querySelector(scopeSelector)
            : scopeSelector;
        if (!scope) return;

        animations.forEach((entry, id) => {
            if (scope.contains(entry.container)) {
                destroy(id);
            }
        });
    }

    /**
     * Destroy ALL animations
     */
    function destroyAll() {
        animations.forEach((entry, id) => {
            if (entry.anim) entry.anim.destroy();
        });
        animations.clear();
    }

    // ─── Convenience helpers for common game animations ──────

    /**
     * Quick one-shot animation: creates, plays, auto-destroys
     * Applies Squash & Stretch principle (lottie-bodymovin)
     */
    function playOneShot(container, animName, options = {}) {
        const animId = create(container, animName, {
            ...options,
            autoplay: false,
            onComplete: () => {
                if (options.onComplete) options.onComplete();
                // Auto cleanup after a brief delay
                setTimeout(() => destroy(animId), 100);
            }
        });

        // Wait for load then play
        const entry = animations.get(animId);
        if (entry?.anim) {
            entry.anim.addEventListener('DOMLoaded', () => {
                if (options.delay) {
                    setTimeout(() => play(animId, options), options.delay);
                } else {
                    play(animId, options);
                }
            });
        }

        return animId;
    }

    /**
     * Create a Lottie container element with proper sizing
     */
    function createContainer(width = 80, height = 80, className = '') {
        const div = document.createElement('div');
        div.style.width = `${width}px`;
        div.style.height = `${height}px`;
        div.style.display = 'inline-block';
        div.style.overflow = 'hidden';
        if (className) div.className = className;
        return div;
    }

    /**
     * Replace an emoji element with a Lottie animation
     * Applies Follow Through principle: animation continues slightly after trigger
     */
    function replaceEmoji(element, animName, options = {}) {
        if (!element) return null;

        const width = options.width || element.offsetWidth || 60;
        const height = options.height || element.offsetHeight || 60;

        // Clear emoji content
        element.textContent = '';
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        element.style.display = 'inline-flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';

        return create(element, animName, {
            loop: options.loop !== undefined ? options.loop : true,
            autoplay: options.autoplay !== undefined ? options.autoplay : true,
            ...options
        });
    }

    // ─── Star Rating System (game-specific) ──────────────────
    /**
     * Animate star rating reveal with staggered timing
     * Disney Principle: Staging + Secondary Action (sparkles after star pop)
     */
    function animateStarRating(containerSelector, starCount, totalStars = 3) {
        const container = typeof containerSelector === 'string'
            ? document.querySelector(containerSelector)
            : containerSelector;
        if (!container) return [];

        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.gap = '12px';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';

        const animIds = [];

        for (let i = 0; i < totalStars; i++) {
            const starDiv = document.createElement('div');
            starDiv.style.width = '60px';
            starDiv.style.height = '60px';

            if (i < starCount) {
                // Earned star - animate with stagger (Staging principle)
                starDiv.className = 'lottie-star earned';
                container.appendChild(starDiv);

                const animId = create(starDiv, 'star-reveal', {
                    autoplay: false,
                    loop: false,
                    ariaLabel: `Star ${i + 1} earned`,
                    onLoaded: () => {
                        // Staggered delay: 300ms between each star
                        setTimeout(() => {
                            play(animId, {
                                anticipation: true, // Disney: Anticipation
                                speed: 1.2          // Disney: Exaggeration
                            });
                            // Play sound for each star
                            if (typeof SoundManager !== 'undefined') {
                                SoundManager.play('star');
                            }
                        }, i * 400);
                    }
                });
                animIds.push(animId);
            } else {
                // Empty star - show grey placeholder
                starDiv.className = 'lottie-star empty';
                starDiv.innerHTML = '<svg viewBox="0 0 24 24" width="40" height="40" style="margin:10px;opacity:0.3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#999"/></svg>';
                container.appendChild(starDiv);
            }
        }

        return animIds;
    }

    // ─── Loading Screen Animation ────────────────────────────
    let loadingAnimId = null;

    function showLoadingAnimation(container) {
        const el = typeof container === 'string'
            ? document.querySelector(container)
            : container;
        if (!el) return;

        el.innerHTML = '';
        loadingAnimId = create(el, 'loading-spinner', {
            loop: true,
            autoplay: true,
            ariaLabel: 'Loading...'
        });
    }

    function hideLoadingAnimation() {
        if (loadingAnimId) {
            destroy(loadingAnimId);
            loadingAnimId = null;
        }
    }

    // ─── Initialization ──────────────────────────────────────
    function init() {
        if (typeof lottie !== 'undefined') {
            lottieReady = true;
            lottie.setQuality(prefersReducedMotion() ? 'low' : 'medium');
            _processPendingQueue();
        } else {
            // Wait for lottie-web to load
            const checkInterval = setInterval(() => {
                if (typeof lottie !== 'undefined') {
                    lottieReady = true;
                    lottie.setQuality(prefersReducedMotion() ? 'low' : 'medium');
                    _processPendingQueue();
                    clearInterval(checkInterval);
                }
            }, 100);

            // Timeout after 10s
            setTimeout(() => clearInterval(checkInterval), 10000);
        }

        watchReducedMotion();
        document.addEventListener('visibilitychange', () => {
            if (typeof lottie === 'undefined') return;
            if (document.hidden) lottie.freeze();
            else lottie.unfreeze();
        });
        console.log('[LottieManager] Initialized');
    }

    function _processPendingQueue() {
        while (pendingQueue.length > 0) {
            const animId = pendingQueue.shift();
            _loadAnimation(animId);
        }
    }

    // ─── Public API ──────────────────────────────────────────
    return {
        init,
        create,
        play,
        playSegment,
        setDirection,
        pause,
        stop,
        goToFrame,
        destroy,
        destroyInScope,
        destroyAll,
        playOneShot,
        createContainer,
        replaceEmoji,
        animateStarRating,
        showLoadingAnimation,
        hideLoadingAnimation,
        // Expose for debugging
        getAnimations: () => animations,
        isReady: () => lottieReady
    };
})();
