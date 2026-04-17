/**
 * INFORMATIKA LAB ADVENTURE
 * Character Selection & Floating Space Background
 * Kahoot-style character picker with sprite animation
 */

const CharacterSystem = (() => {
    // ============================================
    // CHARACTER DATA
    // ============================================

    const BASE = 'assets/kenney_toon-characters-1';

    const characters = [
        {
            id: 'maleAdventurer',
            name: 'Alex',
            folder: 'Male adventurer',
            prefix: 'character_maleAdventurer',
            color: '#38bdf8'
        },
        {
            id: 'femaleAdventurer',
            name: 'Luna',
            folder: 'Female adventurer',
            prefix: 'character_femaleAdventurer',
            color: '#f472b6'
        },
        {
            id: 'malePerson',
            name: 'Budi',
            folder: 'Male person',
            prefix: 'character_malePerson',
            color: '#4ade80'
        },
        {
            id: 'femalePerson',
            name: 'Sari',
            folder: 'Female person',
            prefix: 'character_femalePerson',
            color: '#a78bfa'
        },
        {
            id: 'robot',
            name: 'Robo',
            folder: 'Robot',
            prefix: 'character_robot',
            color: '#22d3ee'
        },
        {
            id: 'zombie',
            name: 'Zed',
            folder: 'Zombie',
            prefix: 'character_zombie',
            color: '#84cc16'
        }
    ];

    // Animation frames for idle cycle
    const IDLE_FRAMES = ['idle', 'cheer0', 'cheer1'];
    // Animation frames for walk cycle (floating in space)
    const WALK_FRAMES = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'walk6', 'walk7'];
    // Fun poses for selection preview
    const PREVIEW_FRAMES = ['idle', 'jump', 'cheer0', 'cheer1', 'kick', 'run0', 'run1'];

    let selectedCharacter = null;
    let playerName = '';
    let animationIntervals = [];
    let floatingAnimId = null;

    // ============================================
    // HELPER: build image path
    // ============================================

    function imgPath(char, pose) {
        return `${BASE}/${char.folder}/PNG/Poses HD/${char.prefix}_${pose}.png`;
    }

    // ============================================
    // CHARACTER SELECT SCREEN
    // ============================================

    function init() {
        // Check if character was previously selected
        const saved = localStorage.getItem('selectedCharacter');
        const savedName = localStorage.getItem('playerName');
        if (savedName) playerName = savedName;

        // Always set up the character select screen so it's ready if user returns
        generateStars();
        renderCharacterCards();
        setupNameInput();
        setupStartButton();

        if (saved) {
            selectedCharacter = characters.find(c => c.id === saved) || null;
            if (selectedCharacter) {
                // Auto-select the saved character card visually
                const card = document.querySelector(`.char-card[data-char-id="${saved}"]`);
                if (card) card.classList.add('selected');
                checkStartReady();
                // Skip select screen, go straight to play mode
                skipToGame();
                return;
            }
        }
    }

    function generateStars() {
        const container = document.getElementById('char-select-stars');
        if (!container) return;
        for (let i = 0; i < 80; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.setProperty('--dur', `${2 + Math.random() * 4}s`);
            star.style.setProperty('--delay', `${Math.random() * 3}s`);
            const size = 1 + Math.random() * 2;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            container.appendChild(star);
        }
    }

    function renderCharacterCards() {
        const grid = document.getElementById('char-grid');
        if (!grid) return;
        grid.innerHTML = '';

        characters.forEach((char, idx) => {
            const card = document.createElement('div');
            card.className = 'char-card';
            card.dataset.charId = char.id;

            // Sprite container with animation frames
            const spriteContainer = document.createElement('div');
            spriteContainer.className = 'char-sprite-container';
            spriteContainer.id = `sprite-${char.id}`;

            // Preload idle frame
            const idleImg = document.createElement('img');
            idleImg.src = imgPath(char, 'idle');
            idleImg.alt = char.name;
            idleImg.draggable = false;
            spriteContainer.appendChild(idleImg);

            const nameEl = document.createElement('p');
            nameEl.className = 'font-display font-bold text-lg mt-1';
            nameEl.style.color = char.color;
            nameEl.textContent = char.name;

            card.appendChild(spriteContainer);
            card.appendChild(nameEl);

            // Click handler
            card.addEventListener('click', () => selectCharacter(char, card));

            // Hover animation
            card.addEventListener('mouseenter', () => startHoverAnim(char));
            card.addEventListener('mouseleave', () => stopHoverAnim(char));

            grid.appendChild(card);

            // Entrance animation
            if (typeof anime !== 'undefined') {
                anime({
                    targets: card,
                    translateY: [60, 0],
                    opacity: [0, 1],
                    scale: [0.8, 1],
                    delay: 300 + idx * 120,
                    duration: 600,
                    easing: 'easeOutBack'
                });
            }
        });

        // Start idle animations for all characters
        startIdleAnimations();
    }

    function startIdleAnimations() {
        characters.forEach(char => {
            let frameIdx = 0;
            const container = document.getElementById(`sprite-${char.id}`);
            if (!container) return;

            const interval = setInterval(() => {
                const frames = IDLE_FRAMES;
                frameIdx = (frameIdx + 1) % frames.length;
                const img = container.querySelector('img');
                if (img) {
                    img.src = imgPath(char, frames[frameIdx]);
                }
            }, 600);

            animationIntervals.push(interval);
        });
    }

    function startHoverAnim(char) {
        const container = document.getElementById(`sprite-${char.id}`);
        if (!container) return;
        const img = container.querySelector('img');
        if (!img) return;

        // Quick preview cycle
        let i = 0;
        const anim = setInterval(() => {
            img.src = imgPath(char, PREVIEW_FRAMES[i % PREVIEW_FRAMES.length]);
            i++;
        }, 200);

        container.dataset.hoverAnim = anim;
    }

    function stopHoverAnim(char) {
        const container = document.getElementById(`sprite-${char.id}`);
        if (!container) return;

        if (container.dataset.hoverAnim) {
            clearInterval(Number(container.dataset.hoverAnim));
            delete container.dataset.hoverAnim;
        }

        const img = container.querySelector('img');
        if (img) img.src = imgPath(char, 'idle');
    }

    function selectCharacter(char, card) {
        selectedCharacter = char;

        // Update card visuals
        document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        // Enable start button only if name also filled
        checkStartReady();

        // Bounce animation on selected
        if (typeof anime !== 'undefined') {
            anime({
                targets: card,
                scale: [1, 1.1, 1],
                duration: 400,
                easing: 'easeOutBack'
            });

            // Show celebration pose
            const container = document.getElementById(`sprite-${char.id}`);
            if (container) {
                const img = container.querySelector('img');
                if (img) img.src = imgPath(char, 'jump');
                setTimeout(() => {
                    if (img) img.src = imgPath(char, 'cheer0');
                }, 300);
            }
        }

        // Save selection
        localStorage.setItem('selectedCharacter', char.id);
    }

    function setupNameInput() {
        const input = document.getElementById('input-player-name');
        if (!input) return;

        // Restore saved name
        if (playerName) input.value = playerName;

        input.addEventListener('input', () => {
            playerName = input.value.trim();
            checkStartReady();
        });
    }

    function checkStartReady() {
        const btn = document.getElementById('btn-start-game');
        if (btn) {
            btn.disabled = !(selectedCharacter && playerName.length > 0);
        }
    }

    function setupStartButton() {
        const btn = document.getElementById('btn-start-game');
        if (!btn) return;

        btn.addEventListener('click', () => {
            if (!selectedCharacter) return;
            // Save name
            playerName = (document.getElementById('input-player-name')?.value || '').trim() || selectedCharacter.name;
            localStorage.setItem('playerName', playerName);

            // Cleanup select screen animations
            animationIntervals.forEach(i => clearInterval(i));
            animationIntervals = [];

            startGame();
        });
    }

    function startGame() {
        // Transition from character select to play mode screen
        const selectScreen = document.getElementById('character-select');

        if (typeof anime !== 'undefined') {
            anime({
                targets: selectScreen,
                opacity: [1, 0],
                scale: [1, 0.95],
                duration: 500,
                easing: 'easeInQuart',
                complete: () => {
                    selectScreen.classList.remove('active');
                    if (typeof Multiplayer !== 'undefined') {
                        Multiplayer.showPlayModeScreen();
                    }
                }
            });
        } else {
            selectScreen.classList.remove('active');
            if (typeof Multiplayer !== 'undefined') {
                Multiplayer.showPlayModeScreen();
            }
        }
    }

    function skipToGame() {
        // Already have a character, go to play mode screen
        const selectScreen = document.getElementById('character-select');
        if (selectScreen) selectScreen.classList.remove('active');

        if (typeof Multiplayer !== 'undefined') {
            Multiplayer.showPlayModeScreen();
        }
    }

    // Called after play mode choice to setup dashboard visuals
    function setupAfterSelect() {
        setupDashboardAvatar();
        setupFloatingBackground();
    }

    // ============================================
    // DASHBOARD AVATAR
    // ============================================

    function setupDashboardAvatar() {
        if (!selectedCharacter) return;

        const avatarImg = document.getElementById('dashboard-avatar');
        const emojiSpan = document.getElementById('dashboard-emoji');

        if (avatarImg) {
            avatarImg.src = imgPath(selectedCharacter, 'idle');
            avatarImg.classList.remove('hidden');
            // Animate avatar between poses
            let poseIdx = 0;
            const poses = ['idle', 'cheer0', 'idle', 'think', 'idle', 'show'];
            setInterval(() => {
                poseIdx = (poseIdx + 1) % poses.length;
                avatarImg.src = imgPath(selectedCharacter, poses[poseIdx]);
            }, 2000);
        }
        if (emojiSpan) {
            emojiSpan.classList.add('hidden');
        }
    }

    // ============================================
    // FLOATING SPACE BACKGROUND
    // ============================================

    function setupFloatingBackground() {
        const container = document.getElementById('space-bg');
        if (!container) return;
        container.innerHTML = '';

        const count = 16;
        const allPoses = ['walk0','walk2','walk4','walk6','run0','run1','jump','fall','cheer0','kick','slide','hang'];

        for (let i = 0; i < count; i++) {
            const char = characters[i % characters.length];
            const pose = allPoses[Math.floor(Math.random() * allPoses.length)];

            const el = document.createElement('div');
            el.className = 'floating-char';

            const img = document.createElement('img');
            img.src = imgPath(char, pose);
            img.alt = '';
            img.draggable = false;
            el.appendChild(img);

            const size = 35 + Math.random() * 55;
            el.style.setProperty('--fsize', `${size}px`);
            el.style.opacity = '0';

            container.appendChild(el);

            // Launch each character with a staggered delay
            setTimeout(() => launchFloater(el, char, i), i * 800 + Math.random() * 2000);
        }

        // Walk frame animation loop
        startFloatingWalkCycle(container);
    }

    function launchFloater(el, char, idx) {
        if (!el || !el.parentNode) return;

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Pick a random edge to enter from (0=top, 1=right, 2=bottom, 3=left)
        const edge = Math.floor(Math.random() * 4);
        let startX, startY;

        switch (edge) {
            case 0: startX = Math.random() * vw; startY = -100; break;
            case 1: startX = vw + 100; startY = Math.random() * vh; break;
            case 2: startX = Math.random() * vw; startY = vh + 100; break;
            case 3: startX = -100; startY = Math.random() * vh; break;
        }

        // Pick a target somewhere across the visible area (or beyond the opposite edge)
        const midX = vw * (0.1 + Math.random() * 0.8);
        const midY = vh * (0.1 + Math.random() * 0.8);

        // Exit on a random edge
        const exitEdge = Math.floor(Math.random() * 4);
        let endX, endY;
        switch (exitEdge) {
            case 0: endX = Math.random() * vw; endY = -120; break;
            case 1: endX = vw + 120; endY = Math.random() * vh; break;
            case 2: endX = Math.random() * vw; endY = vh + 120; break;
            case 3: endX = -120; endY = Math.random() * vh; break;
        }

        el.style.left = '0px';
        el.style.top = '0px';

        const duration = 8000 + Math.random() * 16000;
        const startRot = -180 + Math.random() * 360;
        const endRot = startRot + (-360 + Math.random() * 720);
        const peakOpacity = 0.10 + Math.random() * 0.15;
        const flipX = Math.random() > 0.5 ? -1 : 1;

        // Optional mid-path wobble point
        const wobX = midX + (-100 + Math.random() * 200);
        const wobY = midY + (-100 + Math.random() * 200);

        if (typeof anime !== 'undefined') {
            anime({
                targets: el,
                keyframes: [
                    {
                        translateX: startX,
                        translateY: startY,
                        rotate: startRot,
                        scaleX: flipX * 0.6,
                        scaleY: 0.6,
                        opacity: 0,
                        duration: 0
                    },
                    {
                        translateX: midX,
                        translateY: midY,
                        rotate: startRot + (endRot - startRot) * 0.4,
                        scaleX: flipX * 1,
                        scaleY: 1,
                        opacity: peakOpacity,
                        duration: duration * 0.4
                    },
                    {
                        translateX: wobX,
                        translateY: wobY,
                        rotate: startRot + (endRot - startRot) * 0.7,
                        scaleX: flipX * 0.9,
                        scaleY: 0.9,
                        opacity: peakOpacity * 0.8,
                        duration: duration * 0.3
                    },
                    {
                        translateX: endX,
                        translateY: endY,
                        rotate: endRot,
                        scaleX: flipX * 0.5,
                        scaleY: 0.5,
                        opacity: 0,
                        duration: duration * 0.3
                    }
                ],
                easing: 'easeInOutSine',
                complete: () => {
                    // Relaunch with new random path after a short pause
                    setTimeout(() => launchFloater(el, char, idx), 500 + Math.random() * 3000);
                }
            });
        }
    }

    function startFloatingWalkCycle(container) {
        if (floatingAnimId) cancelAnimationFrame(floatingAnimId);

        const floaters = container.querySelectorAll('.floating-char');
        let lastTime = 0;
        let frameIndex = 0;

        function tick(time) {
            if (time - lastTime > 200) {
                lastTime = time;
                frameIndex = (frameIndex + 1) % WALK_FRAMES.length;

                floaters.forEach((el, i) => {
                    const char = characters[i % characters.length];
                    const img = el.querySelector('img');
                    if (img) {
                        const offset = (frameIndex + i * 2) % WALK_FRAMES.length;
                        img.src = imgPath(char, WALK_FRAMES[offset]);
                    }
                });
            }
            floatingAnimId = requestAnimationFrame(tick);
        }

        floatingAnimId = requestAnimationFrame(tick);
    }

    // ============================================
    // PUBLIC API
    // ============================================

    function getSelected() {
        return selectedCharacter ? { ...selectedCharacter, playerName: playerName || selectedCharacter.name } : null;
    }

    function getPlayerName() {
        return playerName || (selectedCharacter ? selectedCharacter.name : 'Player');
    }

    function getImgPath(pose) {
        if (!selectedCharacter) return '';
        return imgPath(selectedCharacter, pose);
    }

    function changeCharacter() {
        localStorage.removeItem('selectedCharacter');
        localStorage.removeItem('playerName');
        selectedCharacter = null;
        playerName = '';
        location.reload();
    }

    return {
        init,
        getSelected,
        getPlayerName,
        getImgPath,
        changeCharacter,
        setupAfterSelect
    };
})();
