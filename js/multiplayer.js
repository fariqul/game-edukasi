/**
 * INFORMATIKA LAB ADVENTURE
 * Multiplayer System — PeerJS-based 2-player rooms
 * Flow: Play Mode → Create/Join Room → VS Screen → Game → Result
 */

const Multiplayer = (() => {
    // ============================================
    // STATE
    // ============================================
    const PREFIX = 'infolab_';

    let peer = null;
    let conn = null;
    let isHost = false;
    let roomPin = '';
    let active = false;

    let myCharacter = null;
    let opponentCharacter = null; // { id, name, folder, prefix, color }

    let gameStartTime = 0;
    let timerInterval = null;
    let reconnectTimer = null;
    let myCompleted = false;
    let myTime = 0;
    let opponentCompleted = false;
    let opponentTime = 0;

    const CHAR_DATA = {
        maleAdventurer:   { name: 'Alex',  folder: 'Male adventurer',   prefix: 'character_maleAdventurer',   color: '#38bdf8' },
        femaleAdventurer: { name: 'Luna',  folder: 'Female adventurer', prefix: 'character_femaleAdventurer', color: '#f472b6' },
        malePerson:       { name: 'Budi',  folder: 'Male person',       prefix: 'character_malePerson',       color: '#4ade80' },
        femalePerson:     { name: 'Sari',  folder: 'Female person',     prefix: 'character_femalePerson',     color: '#a78bfa' },
        robot:            { name: 'Robo',  folder: 'Robot',             prefix: 'character_robot',            color: '#22d3ee' },
        zombie:           { name: 'Zed',   folder: 'Zombie',            prefix: 'character_zombie',           color: '#84cc16' }
    };

    // ============================================
    // HELPERS
    // ============================================

    function generatePin() {
        return String(Math.floor(100000 + Math.random() * 900000));
    }

    function charImgPath(charId, pose) {
        const c = CHAR_DATA[charId];
        if (!c) return '';
        return `assets/kenney_toon-characters-1/${c.folder}/PNG/Poses HD/${c.prefix}_${pose}.png`;
    }

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(id);
        if (target) {
            target.classList.add('active');
            target.style.opacity = 1;
        }
    }

    function formatTime(ms) {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    function mapPeerError(errType) {
        if (typeof MultiplayerRules !== 'undefined') {
            return MultiplayerRules.mapPeerErrorMessage(errType, isHost);
        }
        return 'Terjadi error koneksi multiplayer.';
    }

    function attemptPeerReconnect(statusEl) {
        if (!peer) return;
        const canReconnect = typeof MultiplayerRules !== 'undefined'
            ? MultiplayerRules.shouldAttemptReconnect(peer)
            : (peer.disconnected && !peer.destroyed);
        if (!canReconnect) return;

        if (statusEl) statusEl.textContent = 'Koneksi putus, mencoba reconnect...';
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
            try {
                peer.reconnect();
            } catch (e) {
                if (statusEl) statusEl.textContent = 'Reconnect gagal. Coba buat/join room lagi.';
            }
        }, 2000);
    }

    // ============================================
    // PLAY MODE SCREEN
    // ============================================

    function showPlayModeScreen() {
        showScreen('play-mode-screen');

        // Show selected character
        const ch = CharacterSystem.getSelected();
        if (ch) {
            const avatar = document.getElementById('pm-avatar');
            if (avatar) {
                avatar.src = charImgPath(ch.id, 'idle');
                avatar.classList.remove('hidden');
            }
            const nameEl = document.getElementById('pm-char-name');
            if (nameEl) nameEl.textContent = CharacterSystem.getPlayerName();
        }

        // Animate entrance
        if (typeof anime !== 'undefined') {
            anime({
                targets: '#play-mode-screen .pm-card',
                translateY: [40, 0],
                opacity: [0, 1],
                scale: [0.9, 1],
                delay: anime.stagger(150, { start: 200 }),
                duration: 500,
                easing: 'easeOutBack'
            });
        }
    }

    function goSolo() {
        active = false;
        // Go to dashboard
        const screen = document.getElementById('play-mode-screen');
        const dashboard = document.getElementById('dashboard');

        if (!screen || !dashboard) return;

        CharacterSystem.setupAfterSelect();

        if (typeof anime !== 'undefined') {
            anime({
                targets: screen,
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuart',
                complete: () => {
                    screen.classList.remove('active');
                    dashboard.classList.add('active');
                    dashboard.style.opacity = 0;
                    anime({
                        targets: dashboard,
                        opacity: [0, 1],
                        translateY: [20, 0],
                        duration: 400,
                        easing: 'easeOutQuart',
                        complete: () => {
                            if (typeof animateDashboardEntrance === 'function') animateDashboardEntrance();
                        }
                    });
                }
            });
        } else {
            screen.classList.remove('active');
            dashboard.classList.add('active');
        }
    }

    function goMultiplayer() {
        showLobbyScreen();
    }

    // ============================================
    // LOBBY SCREEN
    // ============================================

    function showLobbyScreen() {
        showScreen('lobby-screen');

        // Reset UI
        const pinDisplay = document.getElementById('lobby-pin-area');
        if (pinDisplay) pinDisplay.classList.add('hidden');
        const joinStatus = document.getElementById('lobby-join-status');
        if (joinStatus) { joinStatus.textContent = ''; joinStatus.className = ''; }
        const createStatus = document.getElementById('lobby-create-status');
        if (createStatus) createStatus.textContent = '';
        const joinInput = document.getElementById('input-room-pin');
        if (joinInput) joinInput.value = '';

        // Animate
        if (typeof anime !== 'undefined') {
            anime({
                targets: '#lobby-screen .lobby-panel',
                translateY: [30, 0],
                opacity: [0, 1],
                delay: anime.stagger(150, { start: 200 }),
                duration: 500,
                easing: 'easeOutBack'
            });
        }
    }

    function createRoom() {
        roomPin = generatePin();
        isHost = true;

        const createStatus = document.getElementById('lobby-create-status');
        if (createStatus) createStatus.textContent = 'Membuat room...';

        // Destroy existing peer if any
        if (peer) { try { peer.destroy(); } catch(e) {} }

        peer = new Peer(PREFIX + roomPin, { debug: 0 });

        peer.on('open', () => {
            // Show PIN
            const pinArea = document.getElementById('lobby-pin-area');
            if (pinArea) pinArea.classList.remove('hidden');
            const pinDigits = document.getElementById('lobby-pin-digits');
            if (pinDigits) {
                pinDigits.innerHTML = roomPin.split('').map(d =>
                    `<span class="pin-digit">${d}</span>`
                ).join('');
            }
            if (createStatus) createStatus.textContent = 'Menunggu lawan bergabung...';
        });

        peer.on('connection', (connection) => {
            conn = connection;
            setupConnection();
        });

        peer.on('error', (err) => {
            if (err.type === 'unavailable-id') {
                roomPin = generatePin();
                peer.destroy();
                createRoom();
            } else {
                if (createStatus) createStatus.textContent = mapPeerError(err.type);
            }
        });

        peer.on('disconnected', () => {
            attemptPeerReconnect(createStatus);
        });
    }

    function joinRoom() {
        const input = document.getElementById('input-room-pin');
        const pin = input ? input.value.trim() : '';
        const joinStatus = document.getElementById('lobby-join-status');

        if (pin.length !== 6 || isNaN(pin)) {
            if (joinStatus) {
                joinStatus.textContent = 'PIN harus 6 digit angka!';
                joinStatus.className = 'text-red-400 text-sm mt-2';
            }
            return;
        }

        isHost = false;
        roomPin = pin;

        if (joinStatus) {
            joinStatus.textContent = 'Menghubungkan...';
            joinStatus.className = 'text-accent-400 text-sm mt-2';
        }

        if (peer) { try { peer.destroy(); } catch(e) {} }

        peer = new Peer(undefined, { debug: 0 });

        peer.on('open', () => {
            conn = peer.connect(PREFIX + pin, { reliable: true });

            conn.on('open', () => {
                setupConnection();
            });

            conn.on('error', () => {
                if (joinStatus) {
                    joinStatus.textContent = 'Gagal terhubung!';
                    joinStatus.className = 'text-red-400 text-sm mt-2';
                }
            });
        });

        peer.on('error', (err) => {
            if (joinStatus) {
                joinStatus.textContent = mapPeerError(err.type);
                joinStatus.className = 'text-red-400 text-sm mt-2';
            }
        });

        peer.on('disconnected', () => {
            attemptPeerReconnect(joinStatus);
        });

        // Timeout
        setTimeout(() => {
            if (!active) {
                if (joinStatus) {
                    joinStatus.textContent = 'Timeout — room tidak ditemukan.';
                    joinStatus.className = 'text-red-400 text-sm mt-2';
                }
            }
        }, 10000);
    }

    // ============================================
    // CONNECTION
    // ============================================

    function setupConnection() {
        if (!conn) return;

        conn.on('open', () => {
            onConnected();
        });

        // If already open (host side gets connection already open)
        if (conn.open) {
            onConnected();
        }

        conn.on('data', handleMessage);

        conn.on('close', () => {
            active = false;
            if (timerInterval) clearInterval(timerInterval);
            showDisconnectNotice();
        });

        conn.on('error', () => {
            showDisconnectNotice();
        });
    }

    function onConnected() {
        active = true;
        myCharacter = CharacterSystem.getSelected();

        // Send my character info
        send('char-info', {
            charId: myCharacter.id,
            charName: CharacterSystem.getPlayerName()
        });
    }

    function send(type, data) {
        if (conn && conn.open) {
            conn.send({ type, data });
        }
    }

    function handleMessage(msg) {
        switch (msg.type) {
            case 'char-info':
                opponentCharacter = {
                    id: msg.data.charId,
                    name: msg.data.charName,
                    ...CHAR_DATA[msg.data.charId]
                };
                showVsScreen();
                break;

            case 'vs-start':
                goToDashboardMultiplayer();
                break;

            case 'game-start':
                onRemoteGameStart(msg.data.mode, msg.data.level);
                break;

            case 'game-complete':
                onOpponentComplete(msg.data.time);
                break;
        }
    }

    // ============================================
    // VS SCREEN
    // ============================================

    function showVsScreen() {
        if (!myCharacter || !opponentCharacter) return;

        showScreen('vs-screen');

        // Player 1 (me)
        const p1Img = document.getElementById('vs-p1-img');
        const p1Name = document.getElementById('vs-p1-name');
        if (p1Img) p1Img.src = charImgPath(myCharacter.id, 'cheer0');
        if (p1Name) {
            p1Name.textContent = CharacterSystem.getPlayerName() + ' (Kamu)';
            p1Name.style.color = CHAR_DATA[myCharacter.id]?.color || '#fff';
        }

        // Player 2 (opponent)
        const p2Img = document.getElementById('vs-p2-img');
        const p2Name = document.getElementById('vs-p2-name');
        if (p2Img) p2Img.src = charImgPath(opponentCharacter.id, 'cheer0');
        if (p2Name) {
            p2Name.textContent = opponentCharacter.name;
            p2Name.style.color = opponentCharacter.color || '#fff';
        }

        // Host controls start button
        const startBtn = document.getElementById('vs-start-btn');
        if (startBtn) {
            if (isHost) {
                startBtn.classList.remove('hidden');
                startBtn.textContent = 'Mulai!';
            } else {
                startBtn.classList.add('hidden');
                const waitMsg = document.getElementById('vs-wait-msg');
                if (waitMsg) waitMsg.classList.remove('hidden');
            }
        }

        // Animate
        if (typeof anime !== 'undefined') {
            anime({ targets: '#vs-p1', translateX: [-100, 0], opacity: [0, 1], duration: 600, easing: 'easeOutBack', delay: 200 });
            anime({ targets: '#vs-vs-text', scale: [0, 1], opacity: [0, 1], duration: 500, easing: 'easeOutElastic(1,.5)', delay: 500 });
            anime({ targets: '#vs-p2', translateX: [100, 0], opacity: [0, 1], duration: 600, easing: 'easeOutBack', delay: 300 });
            anime({ targets: '#vs-start-btn, #vs-wait-msg', translateY: [20, 0], opacity: [0, 1], duration: 400, delay: 900, easing: 'easeOutQuart' });
        }
    }

    function vsStart() {
        if (!isHost) return;
        send('vs-start', {});
        goToDashboardMultiplayer();
    }

    // ============================================
    // DASHBOARD (MULTIPLAYER)
    // ============================================

    function goToDashboardMultiplayer() {
        CharacterSystem.setupAfterSelect();

        showScreen('dashboard');

        // Show opponent info bar on dashboard
        showOpponentBar(true);
        updateOpponentBarStatus('Menunggu host memilih mode...');

        // If guest, disable mode cards clicking and overlay message
        if (!isHost) {
            document.querySelectorAll('.mode-card').forEach(card => {
                card.style.pointerEvents = 'none';
                card.style.opacity = '0.6';
            });
            const guestMsg = document.getElementById('mp-guest-waiting');
            if (guestMsg) guestMsg.classList.remove('hidden');
        } else {
            // Host: mode cards trigger multiplayer game start
            document.querySelectorAll('.mode-card').forEach(card => {
                card.style.pointerEvents = '';
                card.style.opacity = '';
            });
            const guestMsg = document.getElementById('mp-guest-waiting');
            if (guestMsg) guestMsg.classList.add('hidden');
        }

        if (typeof animateDashboardEntrance === 'function') animateDashboardEntrance();
    }

    // Called when host clicks a mode card (intercepted by main.js)
    function startMultiplayerMode(mode) {
        if (!active || !isHost) return;

        const level = GameState.currentLevel[mode] || 1;
        send('game-start', { mode, level });
        beginGame(mode, level);
    }

    // Called on guest when host picks a mode
    function onRemoteGameStart(mode, level) {
        GameState.currentLevel[mode] = level;
        beginGame(mode, level);
    }

    async function beginGame(mode, level) {
        // Reset state
        myCompleted = false;
        myTime = 0;
        opponentCompleted = false;
        opponentTime = 0;
        gameStartTime = Date.now();

        // Navigate to the mode
        if (typeof navigateTo === 'function') {
            await navigateTo(mode);
        }

        // Start timer
        startTimer();

        // Update opponent bar
        updateOpponentBarStatus('Mengerjakan...');
        showOpponentBar(true);
    }

    // ============================================
    // TIMER
    // ============================================

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        gameStartTime = Date.now();

        const timerEl = document.getElementById('mp-timer');

        timerInterval = setInterval(() => {
            const elapsed = Date.now() - gameStartTime;
            if (timerEl) timerEl.textContent = '⏱ ' + formatTime(elapsed);
        }, 200);
    }

    function stopTimer() {
        if (timerInterval) clearInterval(timerInterval);
    }

    // ============================================
    // GAME COMPLETION
    // ============================================

    function onMyComplete() {
        if (!active || myCompleted) return;

        myCompleted = true;
        myTime = Date.now() - gameStartTime;

        send('game-complete', { time: myTime });

        if (opponentCompleted) {
            // Both done — show result
            stopTimer();
            setTimeout(() => showResult(), 500);
        } else {
            // Waiting for opponent
            updateOpponentBarStatus('Kamu selesai! Menunggu lawan...');
        }
    }

    function onOpponentComplete(time) {
        opponentCompleted = true;
        opponentTime = time;

        if (myCompleted) {
            // Both done
            stopTimer();
            setTimeout(() => showResult(), 500);
        } else {
            // Opponent finished first
            updateOpponentBarStatus(`Lawan selesai! (${formatTime(time)})`);
        }
    }

    // ============================================
    // RESULT
    // ============================================

    function showResult() {
        const won = myTime <= opponentTime;
        const modal = document.getElementById('mp-result-modal');
        if (!modal) return;

        modal.classList.remove('hidden');
        modal.classList.add('flex');

        const emoji = document.getElementById('mp-result-emoji');
        const title = document.getElementById('mp-result-title');
        const detail = document.getElementById('mp-result-detail');

        const winnerSvg = '<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3h8v4a4 4 0 0 1-8 0V3Z"/><path d="M6 7H4a3 3 0 0 0 3 3m8-3h2a3 3 0 0 1-3 3"/><path d="M12 11v4m-3 6h6"/></svg>';
        const loseSvg = '<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></svg>';

        if (won) {
            if (emoji) {
                emoji.innerHTML = winnerSvg;
                emoji.className = 'text-6xl mb-3 text-amber-300 flex justify-center';
            }
            if (title) { title.textContent = 'Kamu Menang!'; title.className = 'font-display text-3xl font-bold text-accent-400 mb-2'; }
        } else {
            if (emoji) {
                emoji.innerHTML = loseSvg;
                emoji.className = 'text-6xl mb-3 text-red-400 flex justify-center';
            }
            if (title) { title.textContent = 'Lawan Menang!'; title.className = 'font-display text-3xl font-bold text-red-400 mb-2'; }
        }

        if (detail) {
            detail.innerHTML = `
                <div class="flex justify-center gap-8 text-sm mt-2">
                    <div class="text-center">
                        <img src="${charImgPath(myCharacter.id, won ? 'cheer0' : 'hurt')}" loading="lazy" decoding="async" class="w-16 h-16 object-contain mx-auto mb-1">
                        <p class="font-bold" style="color:${CHAR_DATA[myCharacter.id]?.color}">${CharacterSystem.getPlayerName()}</p>
                        <p class="text-accent-400 font-mono text-lg">${formatTime(myTime)}</p>
                    </div>
                    <div class="text-center">
                        <img src="${charImgPath(opponentCharacter.id, !won ? 'cheer0' : 'hurt')}" loading="lazy" decoding="async" class="w-16 h-16 object-contain mx-auto mb-1">
                        <p class="font-bold" style="color:${opponentCharacter.color}">${opponentCharacter.name}</p>
                        <p class="text-accent-400 font-mono text-lg">${formatTime(opponentTime)}</p>
                    </div>
                </div>
            `;
        }

        if (typeof anime !== 'undefined') {
            anime({ targets: modal, opacity: [0, 1], duration: 300, easing: 'easeOutQuart' });
            anime({ targets: '#mp-result-content', scale: [0.7, 1], opacity: [0, 1], duration: 500, delay: 100, easing: 'easeOutBack' });
        }
    }

    function hideResult() {
        const modal = document.getElementById('mp-result-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    function resultBackToMenu() {
        hideResult();
        stopTimer();
        showOpponentBar(false);
        goToDashboardMultiplayer();
    }

    function resultPlayAgain() {
        hideResult();
        // Restart same mode
        const mode = GameState.currentScreen;
        if (mode && mode !== 'dashboard') {
            if (isHost) {
                const level = GameState.currentLevel[mode] || 1;
                send('game-start', { mode, level });
                beginGame(mode, level);
            }
        }
    }

    // ============================================
    // OPPONENT BAR
    // ============================================

    function showOpponentBar(show) {
        const bar = document.getElementById('mp-opponent-bar');
        if (!bar) return;

        if (show && active && opponentCharacter) {
            bar.classList.remove('hidden');
            const img = document.getElementById('mp-opp-avatar');
            const name = document.getElementById('mp-opp-name');
            if (img) img.src = charImgPath(opponentCharacter.id, 'idle');
            if (name) {
                name.textContent = opponentCharacter.name + ' (Lawan)';
                name.style.color = opponentCharacter.color;
            }
        } else {
            bar.classList.add('hidden');
        }
    }

    function updateOpponentBarStatus(text) {
        const el = document.getElementById('mp-opp-status');
        if (el) el.textContent = text;
    }

    // ============================================
    // DISCONNECT HANDLING
    // ============================================

    function showDisconnectNotice() {
        showOpponentBar(false);
        stopTimer();
        const bar = document.getElementById('mp-opponent-bar');
        if (bar) {
            bar.classList.remove('hidden');
            const status = document.getElementById('mp-opp-status');
            if (status) {
                status.textContent = 'Lawan terputus!';
                status.className = 'text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400';
            }
        }
        // Re-enable mode cards
        document.querySelectorAll('.mode-card').forEach(card => {
            card.style.pointerEvents = '';
            card.style.opacity = '';
        });
    }

    function disconnect() {
        active = false;
        if (timerInterval) clearInterval(timerInterval);
        if (reconnectTimer) clearTimeout(reconnectTimer);
        if (conn) { try { conn.close(); } catch(e) {} conn = null; }
        if (peer) { try { peer.destroy(); } catch(e) {} peer = null; }
        showOpponentBar(false);
    }

    function backFromLobby() {
        disconnect();
        showPlayModeScreen();
    }

    // ============================================
    // PUBLIC API
    // ============================================

    return {
        showPlayModeScreen,
        goSolo,
        goMultiplayer,
        createRoom,
        joinRoom,
        vsStart,
        backFromLobby,
        startMultiplayerMode,
        onMyComplete,
        resultBackToMenu,
        resultPlayAgain,
        hideResult,
        showOpponentBar,
        disconnect,
        isActive: () => active,
        isHostPlayer: () => isHost,
        charImgPath
    };
})();
