/**
 * INFORMATIKA LAB ADVENTURE
 * Multiplayer System — PeerJS-based 2-player rooms
 * Flow: Play Mode → Create/Join Room → VS Screen → Game → Result
 */

const Multiplayer = (() => {
    // ============================================
    // STATE
    // ============================================
    const runtimeConfig = (typeof MultiplayerConfig !== 'undefined' && typeof MultiplayerConfig.getConfig === 'function')
        ? MultiplayerConfig.getConfig((window.GAME_EDUKASI_CONFIG && window.GAME_EDUKASI_CONFIG.multiplayer) || {})
        : { prefix: 'infolab_', peerOptions: { debug: 0, config: { iceServers: [] } } };

    const PREFIX = runtimeConfig.prefix;
    const PEER_OPTIONS = runtimeConfig.peerOptions;

    let peer = null;
    let conn = null;
    let isHost = false;
    let roomPin = '';
    let active = false;

    let myCharacter = null;
    let roomPlayers = []; // Array of all players {id, name, charId, color, ready, completedTime, isMe}
    let opponentCharacters = {}; // Quick lookup by id

    let gameStartTime = 0;
    let timerInterval = null;
    let reconnectTimer = null;
    let myPlayerId = null;
    let myCompleted = false;
    let myTime = 0;
    let gameCompletions = {}; // {playerId: time}

    let classBattleBridge = null;
    let classBattleSession = null;
    let classBattleParticipant = null;
    let classBattleRole = 'guest';
    let classBattleActive = false;
    let classBattleRoundStartedAt = 0;

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

    function createPeer(peerId) {
        if (typeof peerId === 'string') {
            return new Peer(peerId, PEER_OPTIONS);
        }
        return new Peer(undefined, PEER_OPTIONS);
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

    function shouldShowGuestWaitingOverlay(currentScreen) {
        if (typeof MultiplayerUiRules !== 'undefined' && typeof MultiplayerUiRules.shouldShowGuestWaitingOverlay === 'function') {
            return MultiplayerUiRules.shouldShowGuestWaitingOverlay({
                active,
                isHost,
                currentScreen
            });
        }
        return active && !isHost && currentScreen === 'dashboard';
    }

    function syncGuestWaitingOverlay(currentScreen) {
        const guestMsg = document.getElementById('mp-guest-waiting');
        if (!guestMsg) return;
        const shouldShow = shouldShowGuestWaitingOverlay(currentScreen);
        guestMsg.classList.toggle('hidden', !shouldShow);
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setClassCreateStatus(message, isError) {
        const el = document.getElementById('class-create-status');
        if (!el) return;
        el.textContent = message || '';
        el.className = `text-xs mt-2 min-h-[20px] ${isError ? 'text-red-400' : 'text-dark-300'}`;
    }

    function setClassJoinStatus(message, isError) {
        const el = document.getElementById('class-join-status');
        if (!el) return;
        el.textContent = message || '';
        el.className = `text-xs min-h-[20px] ${isError ? 'text-red-400' : 'text-dark-300'}`;
    }

    function setClassSessionStatus(message, isError) {
        const el = document.getElementById('class-session-status');
        if (!el) return;
        el.textContent = message || '';
        el.className = `text-sm ${isError ? 'text-red-400' : 'text-accent-300'}`;
    }

    function setClassCountdownLabel(left) {
        const el = document.getElementById('class-countdown-label');
        if (!el) return;
        if (left === '-' || left === null || typeof left === 'undefined') {
            el.textContent = 'Countdown: -';
            return;
        }
        el.textContent = `Countdown: ${Math.max(0, Number(left) || 0)} detik`;
    }

    function setClassSessionCode(code) {
        const el = document.getElementById('class-session-code');
        if (!el) return;
        el.textContent = code || '-';
    }

    function isHostLobbyLockedInClassBattle() {
        return Boolean(classBattleActive)
            && classBattleRole === 'host'
            && Boolean(classBattleSession)
            && classBattleSession.status === 'in_progress';
    }

    function syncLobbyBackButtonState() {
        const backBtn = document.getElementById('lobby-back-btn');
        if (!backBtn) return;

        const locked = isHostLobbyLockedInClassBattle();
        backBtn.disabled = locked;
        backBtn.title = locked
            ? 'Host tidak bisa keluar dari lobby saat sesi class battle berjalan.'
            : '';
    }

    function getClassBattleBridge() {
        if (classBattleBridge) return classBattleBridge;
        
        // Try real Supabase first
        if (typeof ClassBattleBridge !== 'undefined' &&
            typeof ClassBattleService !== 'undefined' &&
            typeof ClassBattleService.createClassBattleService === 'function' &&
            window.GameSupabase && window.GameSupabase.enabled && window.GameSupabase.client) {
            
            const service = ClassBattleService.createClassBattleService(window.GameSupabase.client, {
                realtimeChannelPrefix: window.GameSupabase.config && window.GameSupabase.config.realtimeChannelPrefix
            });
            
            classBattleBridge = ClassBattleBridge.createBridge({
                service,
                onStartCountdown(seconds) {
                    setClassCountdownLabel(seconds);
                    setClassSessionStatus(`Countdown dimulai (${seconds} detik).`, false);
                },
                onCountdownTick(left) {
                    setClassCountdownLabel(left);
                },
                onSessionLocked() {
                    finishClassBattleSession('finished');
                },
                onRankingUpdated(ranking) {
                    renderClassBattleRanking(ranking);
                },
                onEvent(eventName, payload) {
                    handleClassBattleEvent(eventName, payload);
                },
                onError(error) {
                    const message = (error && error.message) || 'Terjadi error class battle.';
                    setClassJoinStatus(message, true);
                }
            });
            return classBattleBridge;
        }
        
        // Fallback to Demo Mode
        console.log('Using Demo Class Battle (local mock, no internet required)');
        if (typeof DemoClassBattleService === 'undefined') {
            console.error('DemoClassBattleService not loaded');
            return null;
        }
        
        const demoService = DemoClassBattleService.createDemoService();
        classBattleBridge = {
            service: demoService,
            resetFirstFinishLock() {},
            syncSessionMeta() {},
            connectRealtime() { return Promise.resolve(); },
            refreshRanking() {
                return demoService.fetchRanking({ sessionId: classBattleSession?.id })
                    .then(ranking => {
                        renderClassBattleRanking(ranking);
                    });
            },
            broadcast(event, payload) {},
            submitCompletion(data) {
                return demoService.submitResultWithRetry(data);
            },
            // Mock callbacks
            onStartCountdown(seconds) {
                setClassCountdownLabel(seconds);
                setClassSessionStatus(`Demo countdown: ${seconds}s`, false);
            },
            onCountdownTick(left) {
                setClassCountdownLabel(left);
            },
            onSessionLocked() {
                finishClassBattleSession('finished');
            },
            onRankingUpdated(ranking) {
                renderClassBattleRanking(ranking);
            },
            onEvent(eventName, payload) {
                handleClassBattleEvent(eventName, payload);
            },
            onError(error) {
                const message = (error && error.message) || 'Demo error.';
                setClassJoinStatus(message, true);
            }
        };
        return classBattleBridge;
    }

    function renderClassBattleRanking(rows) {
        const rankedRows = Array.isArray(rows) ? rows : [];

        function renderInto(list) {
            if (!list) return;
            if (rankedRows.length === 0) {
                list.innerHTML = '<li class="text-xs text-dark-300">Belum ada submission.</li>';
                return;
            }

            list.innerHTML = rankedRows.slice(0, 30).map((row, index) => {
                const rank = Number(row.rank) || index + 1;
                const name = escapeHtml(row.participantName || row.display_name || 'Peserta');
                const reachedLevel = Math.max(0, Number(row.reached_level) || 0);
                const score = Number(row.score) || 0;
                const timeMs = Number(row.timeMs ?? row.time_ms) || 0;
                return `
                    <li class="flex items-center justify-between gap-3 rounded-lg border border-dark-700 bg-dark-800/60 px-3 py-2">
                        <span class="text-sm text-dark-100">#${rank} ${name}</span>
                        <span class="text-xs font-mono text-accent-300">Lv.${reachedLevel} • ${score} pts • ${formatTime(timeMs)}</span>
                    </li>
                `;
            }).join('');
        }

        renderInto(document.getElementById('class-battle-ranking-list'));
        renderInto(document.getElementById('class-live-progress-list'));
    }

    function showClassBattleResultModal() {
        const modal = document.getElementById('mp-result-modal');
        if (!modal) return;

        modal.classList.remove('hidden');
        modal.classList.add('flex');

        const title = document.getElementById('mp-result-title');
        if (title) {
            title.textContent = 'Ranking Class Battle';
            title.className = 'font-display text-3xl font-bold text-accent-400 mb-2';
        }

        const detail = document.getElementById('mp-result-detail');
        if (detail) {
            detail.classList.add('hidden');
            detail.innerHTML = '';
        }

        const classPanel = document.getElementById('class-battle-result-panel');
        if (classPanel) classPanel.classList.remove('hidden');

        const statusEl = document.getElementById('class-battle-result-status');
        if (statusEl) {
            const status = classBattleSession && classBattleSession.status
                ? classBattleSession.status
                : 'finished';
            statusEl.textContent = `Status sesi: ${status}`;
        }

        const playAgainBtn = document.getElementById('mp-btn-play-again');
        if (playAgainBtn) playAgainBtn.classList.add('hidden');
    }

    function hideClassBattleResultPanel() {
        const panel = document.getElementById('class-battle-result-panel');
        if (panel) panel.classList.add('hidden');

        const detail = document.getElementById('mp-result-detail');
        if (detail) detail.classList.remove('hidden');

        const playAgainBtn = document.getElementById('mp-btn-play-again');
        if (playAgainBtn) playAgainBtn.classList.remove('hidden');
    }

    async function finishClassBattleSession(status) {
        const bridge = getClassBattleBridge();
        if (!bridge || !classBattleSession || !classBattleSession.id) return;
        if (classBattleSession.status === 'finished' || classBattleSession.status === 'cancelled') {
            classBattleActive = false;
            syncLobbyBackButtonState();
            showClassBattleResultModal();
            return;
        }

        const finalStatus = status || 'finished';
        try {
            const session = await bridge.service.finishSession({
                sessionId: classBattleSession.id,
                status: finalStatus
            });
            classBattleSession = session || classBattleSession;
            await bridge.broadcast('session-finished', {
                status: classBattleSession.status || finalStatus
            });
        } catch (error) {
            setClassJoinStatus((error && error.message) || 'Gagal menutup sesi class battle.', true);
        } finally {
            classBattleActive = false;
            setClassSessionStatus('Sesi class battle ditutup.', false);
            syncLobbyBackButtonState();
            await bridge.refreshRanking().catch(() => {});
            showClassBattleResultModal();
        }
    }

    function handleClassBattleEvent(eventName, payload) {
        if (!eventName) return;

        if (eventName === 'session-started') {
            classBattleActive = true;
            const mode = (payload && payload.mode) || (classBattleSession && classBattleSession.mode);

            if (classBattleRole === 'host') {
                setClassSessionStatus('Class battle berjalan. Host sedang memantau progres peserta.', false);
                syncLobbyBackButtonState();
                return;
            }

            classBattleRoundStartedAt = Date.now();
            if (mode && typeof navigateTo === 'function') {
                navigateTo(mode);
            }
            setClassSessionStatus('Class battle sudah dimulai.', false);
            return;
        }

        if (eventName === 'session-finished') {
            classBattleActive = false;
            if (classBattleSession) {
                classBattleSession.status = (payload && payload.status) || 'finished';
            }
            setClassSessionStatus('Sesi selesai. Menampilkan ranking akhir.', false);
            syncLobbyBackButtonState();
            const bridge = getClassBattleBridge();
            if (bridge) bridge.refreshRanking().catch(() => {});
            showClassBattleResultModal();
        }
    }

    // ============================================
    // PLAY MODE SCREEN
    // ============================================

    function showPlayModeScreen() {
        syncGuestWaitingOverlay('play-mode-screen');
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

        setClassCreateStatus('', false);
        setClassJoinStatus('', false);
        if (!classBattleSession) {
            setClassSessionCode('-');
            setClassSessionStatus('Belum terhubung', false);
            setClassCountdownLabel('-');
            renderClassBattleRanking([]);
        }

        const classStartBtn = document.getElementById('class-start-btn');
        if (classStartBtn && classBattleRole !== 'host') {
            classStartBtn.classList.add('hidden');
        }

        syncLobbyBackButtonState();

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

        peer = createPeer(PREFIX + roomPin);

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

        peer = createPeer();

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

    async function createClassBattleRoom() {
        const bridge = getClassBattleBridge();
        if (!bridge) {
            setClassCreateStatus('Supabase belum siap untuk class battle.', true);
            return;
        }

        const hostNameEl = document.getElementById('class-host-name');
        const modeEl = document.getElementById('class-mode-select');
        const targetEl = document.getElementById('class-target-level');

        const hostName = (hostNameEl && hostNameEl.value.trim())
            || (typeof CharacterSystem !== 'undefined' ? CharacterSystem.getPlayerName() : '')
            || 'Host';
        const mode = modeEl ? modeEl.value : 'coding';
        const targetLevel = Math.max(1, Math.floor(Number(targetEl && targetEl.value) || 1));

        setClassCreateStatus('Membuat sesi class battle...', false);
        setClassJoinStatus('', false);

        active = false;
        if (conn) { try { conn.close(); } catch (e) {} conn = null; }
        if (peer) { try { peer.destroy(); } catch (e) {} peer = null; }
        showOpponentBar(false);

        try {
            const session = await bridge.service.createSession({
                hostName,
                mode,
                targetLevel,
                maxParticipants: 30
            });

            const joined = await bridge.service.joinSession({
                sessionCode: session.session_code,
                displayName: hostName,
                playerToken: session.host_token,
                isHost: true
            });

            classBattleSession = joined.session || session;
            classBattleParticipant = joined.participant;
            classBattleRole = 'host';
            classBattleActive = false;
            isHost = true;

            bridge.resetFirstFinishLock();
            bridge.syncSessionMeta({
                session: classBattleSession,
                participant: classBattleParticipant,
                role: 'host'
            });
            await bridge.connectRealtime(classBattleSession.session_code);

            setClassSessionCode(classBattleSession.session_code);
            setClassSessionStatus('Sesi dibuat. Bagikan kode ke peserta.', false);
            setClassCountdownLabel('-');
            setClassCreateStatus('Sesi siap. Tekan "Mulai Class Battle" saat semua peserta sudah masuk.', false);

            const startBtn = document.getElementById('class-start-btn');
            if (startBtn) startBtn.classList.remove('hidden');

            await bridge.refreshRanking().catch(() => {});
        } catch (error) {
            setClassCreateStatus((error && error.message) || 'Gagal membuat sesi class battle.', true);
        }
    }

    async function joinClassBattleRoom() {
        const bridge = getClassBattleBridge();
        if (!bridge) {
            setClassJoinStatus('Supabase belum siap untuk class battle.', true);
            return;
        }

        const nameEl = document.getElementById('class-join-name');
        const codeEl = document.getElementById('class-join-code');
        const displayName = (nameEl && nameEl.value.trim()) || 'Peserta';
        const sessionCode = (codeEl && codeEl.value.trim()) || '';

        if (sessionCode.length !== 6 || isNaN(sessionCode)) {
            setClassJoinStatus('Kode sesi harus 6 digit angka.', true);
            return;
        }

        setClassJoinStatus('Menghubungkan ke sesi class battle...', false);
        setClassCreateStatus('', false);

        active = false;
        if (conn) { try { conn.close(); } catch (e) {} conn = null; }
        if (peer) { try { peer.destroy(); } catch (e) {} peer = null; }
        showOpponentBar(false);

        try {
            const joined = await bridge.service.joinSession({
                sessionCode,
                displayName,
                isHost: false
            });

            classBattleSession = joined.session;
            classBattleParticipant = joined.participant;
            classBattleRole = 'guest';
            classBattleActive = false;
            isHost = false;

            bridge.resetFirstFinishLock();
            bridge.syncSessionMeta({
                session: classBattleSession,
                participant: classBattleParticipant,
                role: 'guest'
            });
            await bridge.connectRealtime(classBattleSession.session_code);

            setClassSessionCode(classBattleSession.session_code);
            setClassSessionStatus('Berhasil bergabung. Menunggu host memulai.', false);
            setClassCountdownLabel('-');
            setClassJoinStatus(`Bergabung sebagai ${classBattleParticipant.display_name}.`, false);

            const startBtn = document.getElementById('class-start-btn');
            if (startBtn) startBtn.classList.add('hidden');

            await bridge.refreshRanking().catch(() => {});

            if (classBattleSession.status === 'in_progress') {
                handleClassBattleEvent('session-started', {
                    mode: classBattleSession.mode,
                    targetLevel: classBattleSession.target_level
                });
            }
        } catch (error) {
            setClassJoinStatus((error && error.message) || 'Gagal bergabung ke class battle.', true);
        }
    }

    async function startClassBattle() {
        const bridge = getClassBattleBridge();
        if (!bridge || !classBattleSession || classBattleRole !== 'host') {
            setClassCreateStatus('Hanya host yang bisa memulai class battle.', true);
            return;
        }

        setClassCreateStatus('Memulai class battle...', false);

        try {
            const started = await bridge.service.startSession({
                sessionId: classBattleSession.id,
                hostToken: classBattleSession.host_token
            });

            classBattleSession = {
                ...classBattleSession,
                ...(started || {}),
                status: (started && started.status) || 'in_progress'
            };
            classBattleActive = true;
            classBattleRoundStartedAt = Date.now();

            bridge.resetFirstFinishLock();
            bridge.syncSessionMeta({
                session: classBattleSession,
                participant: classBattleParticipant,
                role: 'host'
            });

            await bridge.broadcast('session-started', {
                mode: classBattleSession.mode,
                targetLevel: classBattleSession.target_level
            });

            setClassSessionStatus('Class battle dimulai. Host memantau progres peserta dari lobby.', false);
            setClassCreateStatus('Sesi berjalan. Pantau progres peserta pada panel live.', false);
            const startBtn = document.getElementById('class-start-btn');
            if (startBtn) startBtn.classList.add('hidden');
            syncLobbyBackButtonState();
        } catch (error) {
            setClassCreateStatus((error && error.message) || 'Gagal memulai class battle.', true);
        }
    }

    async function onClassBattleComplete(mode, payload) {
        if (!classBattleActive) return;
        if (classBattleRole === 'host') return;

        const bridge = getClassBattleBridge();
        if (!bridge || !classBattleSession || !classBattleParticipant) return;
        if (mode !== classBattleSession.mode) return;

        try {
            bridge.service.assertSessionOpen(classBattleSession);
        } catch (error) {
            setClassJoinStatus((error && error.message) || 'Sesi class battle sudah ditutup.', true);
            classBattleActive = false;
            return;
        }

        const reachedLevel = Math.max(
            1,
            Math.floor(Number(payload && payload.reachedLevel) || (GameState.currentLevel[mode] || 1))
        );
        const targetLevel = Math.max(1, Math.floor(Number(classBattleSession.target_level) || 1));
        const elapsedMs = Math.max(0, Date.now() - classBattleRoundStartedAt);

        try {
            await bridge.submitCompletion({
                reachedLevel,
                targetLevel,
                elapsedMs,
                participantId: classBattleParticipant.id
            });

            await bridge.refreshRanking();
            await bridge.broadcast('ranking-updated', {
                participantId: classBattleParticipant.id
            });

            if (reachedLevel >= targetLevel) {
                const countdownSession = await bridge.service.startFirstFinishWindow({
                    sessionId: classBattleSession.id,
                    countdownSeconds: 10
                });

                if (countdownSession && countdownSession.first_finish_started_at) {
                    classBattleSession = {
                        ...classBattleSession,
                        ...countdownSession
                    };
                    bridge.applyCountdownFromServer(
                        countdownSession.first_finish_started_at,
                        countdownSession.finish_countdown_seconds
                    );
                    await bridge.broadcast('first-finish-window-started', {
                        startedAt: countdownSession.first_finish_started_at,
                        seconds: countdownSession.finish_countdown_seconds
                    });
                }

                setClassSessionStatus(`Target level ${targetLevel} tercapai. Menunggu hitung mundur selesai...`, false);
            } else {
                setClassSessionStatus(`Progres terkirim (level ${reachedLevel}/${targetLevel}).`, false);
            }
        } catch (error) {
            setClassJoinStatus((error && error.message) || 'Gagal mengirim hasil class battle.', true);
        }
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

    function addPlayer(playerData, isMe = false) {
        const existing = roomPlayers.find(p => p.id === playerData.id);
        if (existing) {
            Object.assign(existing, playerData);
        } else {
            roomPlayers.push({ ...playerData, isMe, ready: false, completedTime: null });
        }
        if (playerData.charId) {
            opponentCharacters[playerData.id] = {
                id: playerData.id,
                name: playerData.charName || playerData.name,
                ...CHAR_DATA[playerData.charId]
            };
        }
        if (isMe) myPlayerId = playerData.id;
        renderRoomPlayers();
    }

    function removePlayer(playerId) {
        roomPlayers = roomPlayers.filter(p => p.id !== playerId);
        delete opponentCharacters[playerId];
        renderRoomPlayers();
    }

    function onConnected() {
        active = true;
        const myChar = CharacterSystem.getSelected();
        myPlayerId = peer.id; // Use peer ID as player ID

        // Send my info (host or guest)
        send('player-joined', {
            id: myPlayerId,
            name: CharacterSystem.getPlayerName(),
            charId: myChar ? myChar.id : null,
            ready: false
        });

        // Add self to room
        addPlayer({
            id: myPlayerId,
            name: CharacterSystem.getPlayerName(),
            charId: myChar ? myChar.id : null,
            isMe: true,
            ready: false
        }, true);

        renderRoomPlayers();

        // Host: start room-state broadcast interval
        if (isHost) {
            setInterval(broadcastRoomState, 1000);
        }
    }

    function broadcastRoomState() {
        if (isHost && conn && conn.open) {
            send('room-state', { players: roomPlayers });
        }
    }

    function send(type, data) {
        if (conn && conn.open) {
            conn.send({ type, data });
        }
    }

    function handleMessage(msg) {
        switch (msg.type) {
            case 'player-joined':
                addPlayer(msg.data);
                break;
            case 'player-left':
                removePlayer(msg.data.id);
                break;
            case 'player-ready':
                const player = roomPlayers.find(p => p.id === msg.data.id);
                if (player) {
                    player.ready = msg.data.ready;
                    renderRoomPlayers();
                }
                break;
            case 'room-state':
                roomPlayers = msg.data.players || [];
                roomPlayers.forEach(p => {
                    if (p.id in opponentCharacters) Object.assign(opponentCharacters[p.id], p);
                });
                renderRoomPlayers();
                break;
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
                onOpponentComplete(msg.data.time, msg.data.playerId);
                break;
        }
    }

    // ============================================
    // VS SCREEN
    // ============================================

    function toggleReady(playerId) {
        const player = roomPlayers.find(p => p.id === playerId);
        if (!player) return;
        player.ready = !player.ready;
        renderRoomPlayers();
        send('player-ready', { id: playerId, ready: player.ready });
    }

    function renderRoomPlayers(listId = null) {
        const lists = listId ? [document.getElementById(listId)] : [
            document.getElementById('lobby-player-list'),
            document.getElementById('vs-player-list')
        ];
        lists.forEach(list => {
            if (!list) return;
            const countEl = list.parentElement?.querySelector('.player-count') || document.getElementById('lobby-player-count');
            if (countEl) {
                const maxPlayers = runtimeConfig.maxPlayers || 8;
                countEl.textContent = `${roomPlayers.length}/${maxPlayers} pemain`;
            }
            list.innerHTML = roomPlayers.map(p => {
                const charData = opponentCharacters[p.id] || CHAR_DATA[p.charId];
                const isReady = p.ready ? 'ready' : '';
                const isHostClass = p.id === roomPlayers[0]?.id ? 'host' : '';
                const isMe = p.isMe;
                const status = p.completedTime ? formatTime(p.completedTime) : (p.ready ? 'Siap' : 'Menunggu');
                let readyBtn = '';
                if (!p.completedTime && !isHostLobbyLockedInClassBattle()) {
                    readyBtn = `<button onclick="Multiplayer.toggleReady('${p.id}')" class="ml-auto px-2 py-1 text-xs rounded-full ${p.ready ? 'bg-secondary-500 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}">${p.ready ? 'Siap ✓' : 'Siap'}</button>`;
                }
                return `
                    <div class="player-list-item ${isReady} ${isHostClass} flex">
                        <img src="${charImgPath(p.charId, 'idle')}" alt="${p.name}" class="player-avatar" loading="lazy">
                        <div class="player-info flex-1">
                            <div class="player-name" style="color: ${charData?.color || '#fff'}">${escapeHtml(p.name)}</div>
                            <div class="player-status">${status}</div>
                        </div>
                        ${readyBtn}
                    </div>
                `;
            }).join('');
        });
    }

    function showVsScreen() {
        showScreen('vs-screen');
        renderRoomPlayers('vs-player-list');
        updateVsPlayerCount();

        const startBtn = document.getElementById('vs-start-btn');
        if (startBtn && isHost && roomPlayers.length >= 2) {
            startBtn.classList.remove('hidden');
        }

        if (typeof anime !== 'undefined') {
            anime({
                targets: '#vs-player-list .player-list-item',
                translateY: [20, 0],
                opacity: [0, 1],
                delay: anime.stagger(100),
                duration: 400,
                easing: 'easeOutBack'
            });
        }
    }

    function updateVsPlayerCount() {
        const countEl = document.getElementById('vs-player-count');
        if (countEl) {
            countEl.textContent = `${roomPlayers.length} pemain siap`;
        }
    }

    function vsStart() {
        if (!isHost || roomPlayers.filter(p => p.ready).length < 2) return;
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

        // If guest, disable mode cards clicking and show wait overlay on dashboard only
        if (!isHost) {
            document.querySelectorAll('.mode-card').forEach(card => {
                card.style.pointerEvents = 'none';
                card.style.opacity = '0.6';
            });
        } else {
            // Host: mode cards trigger multiplayer game start
            document.querySelectorAll('.mode-card').forEach(card => {
                card.style.pointerEvents = '';
                card.style.opacity = '';
            });
        }

        syncGuestWaitingOverlay('dashboard');

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
        syncGuestWaitingOverlay(mode);

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

    function renderResultRanking() {
        const completedPlayers = roomPlayers.filter(p => p.completedTime).sort((a, b) => a.completedTime - b.completedTime);
        const listEl = document.getElementById('result-player-list');
        if (!listEl) return;

        listEl.innerHTML = completedPlayers.map((p, index) => {
            const charData = opponentCharacters[p.id] || CHAR_DATA[p.charId];
            const rankColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-dark-300';
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
            return `
                <div class="flex items-center gap-3 p-3 rounded-xl bg-dark-800 border border-dark-700">
                    <span class="text-2xl font-bold ${rankColor}">${medal}</span>
                    <img src="${charImgPath(p.charId, 'idle')}" alt="${p.name}" class="w-12 h-12 object-contain rounded-lg border-2 border-primary-500/50">
                    <div class="flex-1 min-w-0">
                        <div class="font-bold text-white truncate" style="color: ${charData?.color || '#fff'}">${escapeHtml(p.name)}</div>
                        <div class="text-xs font-mono text-accent-400">${formatTime(p.completedTime)}</div>
                    </div>
                </div>
            `;
        }).join('');

        const modalTitle = document.getElementById('mp-result-title');
        if (modalTitle) {
            const myRank = completedPlayers.findIndex(p => p.isMe);
            const myTime = roomPlayers.find(p => p.isMe)?.completedTime;
            if (myRank === 0 && myTime) {
                modalTitle.textContent = `🥇 Kamu Juara 1! (${formatTime(myTime)})`;
            } else if (myRank > -1) {
                modalTitle.textContent = `🏆 Kamu Peringkat ${myRank + 1}!`;
            } else {
                modalTitle.textContent = 'Hasil Pertandingan';
            }
        }

        // Show modal
        const modal = document.getElementById('mp-result-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    function onMyComplete() {
        if (!active || myCompleted) return;

        myCompleted = true;
        myTime = Date.now() - gameStartTime;
        roomPlayers.find(p => p.isMe).completedTime = myTime;
        send('game-complete', { time: myTime, playerId: myPlayerId });
        renderRoomPlayers();

        // Check if all ready players have completed
        const readyPlayers = roomPlayers.filter(p => p.ready);
        const allCompleted = readyPlayers.every(p => p.completedTime);
        if (allCompleted) {
            stopTimer();
            setTimeout(() => renderResultRanking(), 800);
        }
    }

    function onOpponentComplete(time, playerId) {
        if (playerId && roomPlayers.find(p => p.id === playerId)) {
            const player = roomPlayers.find(p => p.id === playerId);
            player.completedTime = time;
            renderRoomPlayers();
        }
        gameCompletions[playerId || 'opponent'] = time;

        // Check if all ready players have completed
        const readyPlayers = roomPlayers.filter(p => p.ready);
        const allCompleted = readyPlayers.every(p => p.completedTime);
        if (allCompleted && myCompleted) {
            stopTimer();
            setTimeout(() => renderResultRanking(), 800);
        }
    }

    // ============================================
    // RESULT
    // ============================================

    // Legacy fallback, now handled by renderResultRanking()
    function showResult() {
        renderResultRanking();
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

        if (classBattleSession) {
            showLobbyScreen();
            return;
        }

        goToDashboardMultiplayer();
    }

    function resultPlayAgain() {
        hideResult();

        if (classBattleSession) {
            showLobbyScreen();
            return;
        }

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
        syncGuestWaitingOverlay('disconnected');
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
        syncGuestWaitingOverlay('disconnected');
        if (timerInterval) clearInterval(timerInterval);
        if (reconnectTimer) clearTimeout(reconnectTimer);
        if (conn) { try { conn.close(); } catch(e) {} conn = null; }
        if (peer) { try { peer.destroy(); } catch(e) {} peer = null; }

        if (classBattleBridge && typeof classBattleBridge.dispose === 'function') {
            classBattleBridge.dispose().catch(() => {});
        }
        classBattleBridge = null;
        classBattleSession = null;
        classBattleParticipant = null;
        classBattleRole = 'guest';
        classBattleActive = false;
        classBattleRoundStartedAt = 0;

        setClassSessionCode('-');
        setClassSessionStatus('Belum terhubung', false);
        setClassCountdownLabel('-');
        hideClassBattleResultPanel();
        syncLobbyBackButtonState();

        showOpponentBar(false);
    }

    function backFromLobby() {
        if (isHostLobbyLockedInClassBattle()) {
            setClassCreateStatus('Host tidak bisa keluar dari lobby sampai sesi class battle selesai.', true);
            return;
        }

        disconnect();
        showPlayModeScreen();
    }

    // ============================================
    // PUBLIC API
    // ============================================

    function showClassBattleHostForm() {
        const hostPanel = document.getElementById('class-host-panel');
        const joinPanel = document.getElementById('class-join-panel');
        const legacyPanels = document.querySelector('#legacy-peerjs');
        
        if (hostPanel) hostPanel.classList.remove('hidden');
        if (joinPanel) joinPanel.classList.add('hidden');
        if (legacyPanels) legacyPanels.classList.add('hidden');
        
        // Auto-fill host name
        const hostNameEl = document.getElementById('class-host-name');
        if (hostNameEl && !hostNameEl.value.trim()) {
            hostNameEl.value = CharacterSystem?.getPlayerName?.() || 'Host';
        }
        hostNameEl?.focus?.();
        
        setClassCreateStatus('', false);
    }
    
    function showClassBattleJoinForm() {
        const hostPanel = document.getElementById('class-host-panel');
        const joinPanel = document.getElementById('class-join-panel');
        const legacyPanels = document.querySelector('#legacy-peerjs');
        
        if (hostPanel) hostPanel.classList.add('hidden');
        if (joinPanel) joinPanel.classList.remove('hidden');
        if (legacyPanels) legacyPanels.classList.add('hidden');
        
        const codeEl = document.getElementById('class-join-code');
        codeEl?.focus?.();
        setClassJoinStatus('', false);
    }
    
    return {
        showClassBattleHostForm,
        showClassBattleJoinForm,
        showPlayModeScreen,
        goSolo,
        goMultiplayer,
        createRoom,
        joinRoom,
        createClassBattleRoom,
        joinClassBattleRoom,
        startClassBattle,
        vsStart,
        backFromLobby,
        startMultiplayerMode,
        onMyComplete,
        onClassBattleComplete,
        resultBackToMenu,
        resultPlayAgain,
        hideResult,
        showOpponentBar,
        disconnect,
        isActive: () => active,
        isClassBattleActive: () => classBattleActive && classBattleRole !== 'host',
        isHostPlayer: () => isHost,
        charImgPath
    };
})();
