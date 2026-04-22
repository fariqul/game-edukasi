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
    let roomStateInterval = null;
    let myPlayerId = null;
    let myCompleted = false;
    let myTime = 0;
    let opponentCompleted = false;
    let opponentTime = 0;
    let opponentCharacter = null;
    let gameCompletions = {}; // {playerId: time}
    let classBattleSubmitTimer = null;

    let classBattleBridge = null;
    let classBattleSession = null;
    let classBattleParticipant = null;
    let classBattleRole = 'guest';
    let classBattleActive = false;
    let classBattleRoundStartedAt = 0;
    let classBattleStartLevel = 1;
    let classParticipantPollTimer = null;
    let classBattleParticipantRows = [];
    let classBattleRankingRows = [];
    let classLevelTimerTicker = null;
    let classLevelTimerStartedAt = 0;
    let classLevelTimerSeconds = 0;
    let classLevelTimerLevel = 1;
    let classLevelTimerTargetLevel = 1;
    const classBattleSavedLevels = {};

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

    function getCurrentModeLevel(mode) {
        if (typeof GameState === 'undefined' || !GameState || !GameState.currentLevel) {
            return 1;
        }
        return Math.max(1, Math.floor(Number(GameState.currentLevel[mode]) || 1));
    }

    function toClassBattleProgressLevel(mode, reachedLevel) {
        const absoluteLevel = Math.max(
            1,
            Math.floor(Number(reachedLevel) || getCurrentModeLevel(mode))
        );
        const startLevel = Math.max(1, Math.floor(Number(classBattleStartLevel) || 1));
        return Math.max(1, absoluteLevel - startLevel + 1);
    }

    function setModeLevel(mode, level) {
        if (!mode || typeof GameState === 'undefined' || !GameState || !GameState.currentLevel) {
            return;
        }
        const normalized = Math.max(1, Math.floor(Number(level) || 1));
        GameState.currentLevel[mode] = normalized;
    }

    function ensureClassBattleStartsFromLevelOne(mode) {
        if (!mode || classBattleRole === 'host') return;
        if (typeof GameState === 'undefined' || !GameState || !GameState.currentLevel) return;

        const current = getCurrentModeLevel(mode);
        if (!classBattleSavedLevels[mode]) {
            classBattleSavedLevels[mode] = current;
        }
        setModeLevel(mode, 1);
    }

    function restoreSavedLevelAfterClassBattle(mode) {
        if (!mode || classBattleRole === 'host') return;
        if (!Object.prototype.hasOwnProperty.call(classBattleSavedLevels, mode)) return;

        setModeLevel(mode, classBattleSavedLevels[mode]);
        delete classBattleSavedLevels[mode];
    }

    function restoreAllSavedLevelsAfterClassBattle() {
        if (classBattleRole === 'host') {
            Object.keys(classBattleSavedLevels).forEach((mode) => {
                delete classBattleSavedLevels[mode];
            });
            return;
        }

        Object.keys(classBattleSavedLevels).forEach((mode) => {
            setModeLevel(mode, classBattleSavedLevels[mode]);
            delete classBattleSavedLevels[mode];
        });
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

    function setClassCountdownLabel(left, meta) {
        const el = document.getElementById('class-countdown-label');
        if (left === '-' || left === null || typeof left === 'undefined') {
            if (el) el.textContent = 'Countdown: -';
            setClassCountdownOverlay('-', null);
            return;
        }

        const safeLeft = Math.max(0, Number(left) || 0);
        const hasLevelMeta = Boolean(meta)
            && Number.isFinite(Number(meta.levelIndex))
            && Number.isFinite(Number(meta.targetLevel));
        if (el) {
            if (hasLevelMeta) {
                const levelIndex = Math.max(1, Math.floor(Number(meta.levelIndex) || 1));
                const targetLevel = Math.max(levelIndex, Math.floor(Number(meta.targetLevel) || levelIndex));
                el.textContent = `Level ${levelIndex}/${targetLevel}: ${safeLeft} detik`;
            } else {
                el.textContent = `Countdown: ${safeLeft} detik`;
            }
        }

        setClassCountdownOverlay(safeLeft, meta);
    }

    function setClassSessionCode(code) {
        const el = document.getElementById('class-session-code');
        if (!el) return;
        el.textContent = code || '-';
    }

    function setClassSessionPanelVisible(visible) {
        const panel = document.getElementById('class-session-panel');
        if (!panel) return;
        panel.classList.toggle('hidden', !visible);
    }

    function setClassCountdownOverlay(left, meta) {
        const overlay = document.getElementById('class-countdown-overlay');
        const valueEl = document.getElementById('class-countdown-overlay-value');
        const labelEl = document.getElementById('class-countdown-overlay-label');
        const levelEl = document.getElementById('class-countdown-overlay-level');
        const progressEl = document.getElementById('class-countdown-overlay-progress');
        if (!overlay || !valueEl) return;

        if (left === '-' || left === null || typeof left === 'undefined') {
            overlay.classList.add('hidden');
            overlay.classList.remove('countdown-overlay-pop', 'countdown-overlay-danger');
            if (progressEl) progressEl.style.width = '0%';
            if (levelEl) levelEl.textContent = '';
            return;
        }

        const safeLeft = Math.max(0, Number(left) || 0);
        const totalSeconds = Math.max(
            1,
            Math.floor(
                Number(meta && meta.totalSeconds)
                || Number(classLevelTimerSeconds)
                || safeLeft
                || 1
            )
        );
        const providedProgress = Number(meta && meta.progress01);
        const progress01 = Number.isFinite(providedProgress)
            ? Math.max(0, Math.min(1, providedProgress))
            : Math.max(0, Math.min(1, (totalSeconds - safeLeft) / totalSeconds));

        valueEl.textContent = String(safeLeft);
        if (labelEl) {
            labelEl.textContent = safeLeft > 0
                ? 'Countdown Per Level'
                : 'Waktu Level Habis';
        }

        if (levelEl) {
            const levelIndex = Math.max(1, Math.floor(Number(meta && meta.levelIndex) || 0));
            const targetLevel = Math.max(levelIndex, Math.floor(Number(meta && meta.targetLevel) || levelIndex));
            levelEl.textContent = (meta && Number.isFinite(Number(meta.levelIndex)))
                ? `Level ${levelIndex}/${targetLevel}`
                : '';
        }

        if (progressEl) {
            progressEl.style.width = `${Math.round(progress01 * 100)}%`;
        }

        overlay.classList.remove('hidden');
        overlay.classList.toggle('countdown-overlay-danger', safeLeft <= 3);
        overlay.classList.remove('countdown-overlay-pop');
        void overlay.offsetWidth;
        overlay.classList.add('countdown-overlay-pop');
    }

    function renderClassParticipantPreview(participants) {
        const rows = Array.isArray(participants) ? participants : [];
        classBattleParticipantRows = rows;
        const list = document.getElementById('class-participant-preview-list');
        const countEl = document.getElementById('class-participant-count');

        if (countEl) {
            countEl.textContent = String(rows.length);
        }

        if (!list) return;

        if (rows.length === 0) {
            list.innerHTML = '<p class="text-xs text-dark-400">Belum ada peserta bergabung.</p>';
            updateClassCompletionProgress();
            return;
        }

        list.innerHTML = rows.slice(0, 30).map((row, index) => {
            const name = escapeHtml((row && row.display_name) || `Peserta ${index + 1}`);
            const hostTag = row && row.is_host
                ? '<span class="ml-2 rounded bg-accent-500/20 px-2 py-0.5 text-[10px] font-bold text-accent-300">HOST</span>'
                : '';
            return `
                <div class="inline-flex items-center rounded-full border border-dark-600 bg-dark-800/70 px-3 py-1 text-xs text-dark-100">
                    <span>${name}</span>${hostTag}
                </div>
            `;
        }).join('');

        updateClassCompletionProgress();
    }

    function getResultTrophySvg() {
        return `
            <span class="ui-icon-chip ui-icon-chip--result mx-auto">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 4h12v3a6 6 0 01-12 0V4z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 8H4.5A2.5 2.5 0 012 5.5V5h4m12 3h1.5A2.5 2.5 0 0022 5.5V5h-4"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 13v4m-3 3h6m-8 0h10"></path>
                </svg>
            </span>
        `;
    }

    function updateClassCompletionProgress() {
        const labels = [
            document.getElementById('class-completion-progress'),
            document.getElementById('result-completion-progress')
        ].filter(Boolean);
        if (labels.length === 0) return;

        const target = Math.max(1, Math.floor(Number(classBattleSession && classBattleSession.target_level) || 1));
        const participants = (classBattleParticipantRows || []).filter((item) => !Boolean(item && item.is_host));
        const total = participants.length;
        if (total === 0) {
            labels.forEach((el) => {
                el.textContent = 'Selesai: 0/0 peserta';
            });
            return;
        }

        const completedSet = new Set((classBattleRankingRows || [])
            .filter((row) => Math.max(0, Number(row && row.reached_level) || 0) >= target)
            .map((row) => String(row && row.participant_id)));

        const done = participants.filter((item) => completedSet.has(String(item && item.id))).length;
        labels.forEach((el) => {
            el.textContent = `Selesai: ${done}/${total} peserta`;
        });
    }

    async function refreshClassParticipants() {
        if (!classBattleSession || !classBattleSession.id) {
            renderClassParticipantPreview([]);
            return [];
        }

        const bridge = classBattleBridge || getClassBattleBridge();
        if (!bridge || !bridge.service || typeof bridge.service.listParticipants !== 'function') {
            return [];
        }

        try {
            const participants = await bridge.service.listParticipants(classBattleSession.id);
            renderClassParticipantPreview(participants);
            return participants;
        } catch (error) {
            console.warn('Gagal mengambil daftar peserta class battle:', error);
            return [];
        }
    }

    function stopClassParticipantPolling() {
        if (!classParticipantPollTimer) return;
        clearInterval(classParticipantPollTimer);
        classParticipantPollTimer = null;
    }

    function startClassParticipantPolling() {
        stopClassParticipantPolling();
        if (!classBattleSession || !classBattleSession.id) return;
        classParticipantPollTimer = setInterval(() => {
            refreshClassParticipants().catch(() => {});
        }, 2000);
    }

    function getClassBattlePerLevelSeconds(session) {
        const safe = Math.floor(Number(session && session.finish_countdown_seconds) || 20);
        return Math.max(10, Math.min(300, safe));
    }

    function stopClassLevelTimer() {
        if (!classLevelTimerTicker) return;
        clearInterval(classLevelTimerTicker);
        classLevelTimerTicker = null;
    }

    function buildClassLevelTimerSnapshot(nowMs) {
        if (!classLevelTimerStartedAt || classLevelTimerSeconds <= 0) return null;

        const now = Number.isFinite(nowMs) ? nowMs : Date.now();
        const elapsedMs = Math.max(0, now - classLevelTimerStartedAt);
        const left = Math.max(0, classLevelTimerSeconds - Math.floor(elapsedMs / 1000));
        const progress01 = Math.max(0, Math.min(1, elapsedMs / (classLevelTimerSeconds * 1000)));

        return {
            left,
            totalSeconds: classLevelTimerSeconds,
            levelIndex: classLevelTimerLevel,
            targetLevel: classLevelTimerTargetLevel,
            progress01
        };
    }

    function renderClassLevelTimerSnapshot(snapshot) {
        if (!snapshot) {
            setClassCountdownLabel('-');
            return;
        }
        setClassCountdownLabel(snapshot.left, snapshot);
    }

    function startClassLevelCountdown({ startedAt, seconds, levelIndex, targetLevel }) {
        stopClassLevelTimer();

        classLevelTimerSeconds = Math.max(1, Math.floor(Number(seconds) || getClassBattlePerLevelSeconds(classBattleSession)));
        classLevelTimerLevel = Math.max(1, Math.floor(Number(levelIndex) || 1));
        classLevelTimerTargetLevel = Math.max(
            classLevelTimerLevel,
            Math.floor(Number(targetLevel) || Math.max(1, Math.floor(Number(classBattleSession && classBattleSession.target_level) || 1)))
        );

        const startedAtMs = typeof startedAt === 'number'
            ? startedAt
            : new Date(startedAt).getTime();
        classLevelTimerStartedAt = Number.isFinite(startedAtMs)
            ? startedAtMs
            : Date.now();

        renderClassLevelTimerSnapshot(buildClassLevelTimerSnapshot(classLevelTimerStartedAt));

        classLevelTimerTicker = setInterval(() => {
            const snapshot = buildClassLevelTimerSnapshot(Date.now());
            renderClassLevelTimerSnapshot(snapshot);

            if (!snapshot || snapshot.left > 0) return;

            stopClassLevelTimer();
            if (
                classBattleRole === 'host'
                && classBattleActive
                && classBattleSession
                && classBattleSession.status === 'in_progress'
            ) {
                onClassLevelTimerElapsed().catch(() => {});
            }
        }, 200);
    }

    async function announceClassLevelTimerStart({ levelIndex, targetLevel, seconds, startedAt }) {
        const bridge = getClassBattleBridge();
        if (!bridge || !classBattleSession || !classBattleSession.id) return;

        const safeSeconds = Math.max(1, Math.floor(Number(seconds) || getClassBattlePerLevelSeconds(classBattleSession)));
        const safeLevel = Math.max(1, Math.floor(Number(levelIndex) || 1));
        const safeTarget = Math.max(
            safeLevel,
            Math.floor(Number(targetLevel) || Math.max(1, Math.floor(Number(classBattleSession.target_level) || 1)))
        );

        const parsedStart = typeof startedAt === 'number'
            ? startedAt
            : new Date(startedAt).getTime();
        const startedAtIso = Number.isFinite(parsedStart)
            ? new Date(parsedStart).toISOString()
            : new Date().toISOString();

        startClassLevelCountdown({
            startedAt: startedAtIso,
            seconds: safeSeconds,
            levelIndex: safeLevel,
            targetLevel: safeTarget
        });

        await bridge.broadcast('session-timer-started', {
            startedAt: startedAtIso,
            seconds: safeSeconds,
            levelIndex: safeLevel,
            targetLevel: safeTarget
        });
    }

    async function onClassLevelTimerElapsed() {
        if (!classBattleSession || classBattleRole !== 'host' || !classBattleActive) return;

        const target = Math.max(
            1,
            Math.floor(Number(classBattleSession.target_level) || Number(classLevelTimerTargetLevel) || 1)
        );
        const currentLevel = Math.max(1, Math.floor(Number(classLevelTimerLevel) || 1));
        const seconds = Math.max(1, Math.floor(Number(classLevelTimerSeconds) || getClassBattlePerLevelSeconds(classBattleSession)));

        if (currentLevel >= target) {
            setClassSessionStatus('Waktu level terakhir habis. Menutup sesi...', false);
            await finishClassBattleSession('finished');
            return;
        }

        const nextLevel = currentLevel + 1;
        setClassSessionStatus(`Waktu level ${currentLevel} habis. Lanjut ke level ${nextLevel}.`, false);
        await announceClassLevelTimerStart({
            levelIndex: nextLevel,
            targetLevel: target,
            seconds
        });
    }

    async function areAllBattleParticipantsDone(bridge, targetLevel, rankingRows) {
        if (!classBattleSession || !classBattleSession.id || !bridge || !bridge.service) {
            return false;
        }

        const participants = await bridge.service.listParticipants(classBattleSession.id);
        const activeParticipants = (participants || []).filter((item) => !Boolean(item && item.is_host));
        if (activeParticipants.length === 0) return false;

        const rows = Array.isArray(rankingRows)
            ? rankingRows
            : await bridge.service.fetchRanking({ sessionId: classBattleSession.id, limit: 100 });

        const doneSet = new Set((rows || [])
            .filter((row) => Math.max(0, Number(row && row.reached_level) || 0) >= targetLevel)
            .map((row) => String(row && row.participant_id)));

        return activeParticipants.every((item) => doneSet.has(String(item && item.id)));
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

        const hasBridgeFactory = typeof ClassBattleBridge !== 'undefined'
            && typeof ClassBattleBridge.createBridge === 'function';
        const hasServiceFactory = typeof ClassBattleService !== 'undefined'
            && typeof ClassBattleService.createClassBattleService === 'function';
        const supabaseReady = Boolean(
            window.GameSupabase
            && window.GameSupabase.enabled
            && window.GameSupabase.client
        );

        if (!hasBridgeFactory || !hasServiceFactory) {
            console.error('Class battle production modules belum termuat.', {
                hasBridgeFactory,
                hasServiceFactory
            });
            return null;
        }

        if (!supabaseReady) {
            const config = window.GameSupabase && window.GameSupabase.config
                ? window.GameSupabase.config
                : null;
            console.error('Supabase client belum siap untuk class battle production.', {
                enabled: Boolean(window.GameSupabase && window.GameSupabase.enabled),
                hasClient: Boolean(window.GameSupabase && window.GameSupabase.client),
                hasUrl: Boolean(config && config.url),
                hasClientKey: Boolean(config && config.clientKey)
            });
            return null;
        }

        const service = ClassBattleService.createClassBattleService(window.GameSupabase.client, {
            realtimeChannelPrefix: window.GameSupabase.config && window.GameSupabase.config.realtimeChannelPrefix
        });

        classBattleBridge = ClassBattleBridge.createBridge({
            service,
            onStartCountdown() {},
            onCountdownTick() {},
            onSessionLocked() {},
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

    function renderClassBattleRanking(rows) {
        const rankedRows = Array.isArray(rows) ? rows : [];
        classBattleRankingRows = rankedRows;
        const liveCountEl = document.getElementById('live-participant-count');
        if (liveCountEl) {
            liveCountEl.textContent = String(rankedRows.length);
        }

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
                const targetLevel = Math.max(1, Number(classBattleSession && classBattleSession.target_level) || 1);
                const badgeTone = rank === 1
                    ? 'border-yellow-300/50 bg-yellow-500/20 text-yellow-200'
                    : rank === 2
                        ? 'border-slate-300/50 bg-slate-400/20 text-slate-200'
                        : rank === 3
                            ? 'border-amber-400/50 bg-amber-500/20 text-amber-200'
                            : 'border-dark-500 bg-dark-700/50 text-dark-200';
                const badgeText = rank <= 3 ? `TOP ${rank}` : `#${rank}`;
                return `
                    <li class="flex items-center gap-3 rounded-xl border border-dark-700 bg-dark-800/60 px-3 py-2">
                        <span class="min-w-[58px] rounded-lg border px-2 py-1 text-center text-[11px] font-extrabold tracking-wide ${badgeTone}">${badgeText}</span>
                        <div class="min-w-0 flex-1">
                            <p class="truncate text-sm font-semibold text-dark-100">${name}</p>
                            <p class="text-[11px] text-dark-300">Lv ${reachedLevel}/${targetLevel} • ${score} pts</p>
                        </div>
                        <span class="text-xs font-mono text-accent-300">${formatTime(timeMs)}</span>
                    </li>
                `;
            }).join('');
        }

        renderInto(document.getElementById('class-battle-ranking-list'));
        renderInto(document.getElementById('class-live-progress-list'));

        const resultList = document.getElementById('result-player-list');
        if (resultList) {
            if (rankedRows.length === 0) {
                resultList.innerHTML = '<p class="text-xs text-dark-300">Belum ada submission.</p>';
            } else {
                resultList.innerHTML = rankedRows.slice(0, 30).map((row, index) => {
                    const rank = Number(row.rank) || index + 1;
                    const name = escapeHtml(row.participantName || row.display_name || 'Peserta');
                    const reachedLevel = Math.max(0, Number(row.reached_level) || 0);
                    const score = Number(row.score) || 0;
                    const timeMs = Number(row.timeMs ?? row.time_ms) || 0;
                    const targetLevel = Math.max(1, Number(classBattleSession && classBattleSession.target_level) || 1);
                    const progressPercent = Math.max(0, Math.min(100, Math.round((reachedLevel / targetLevel) * 100)));
                    const cardTone = rank === 1
                        ? 'border-yellow-300/50 bg-yellow-500/10'
                        : rank === 2
                            ? 'border-slate-300/45 bg-slate-500/10'
                            : rank === 3
                                ? 'border-amber-400/45 bg-amber-500/10'
                                : 'border-dark-700 bg-dark-800/70';
                    const badgeTone = rank === 1
                        ? 'border-yellow-300/50 bg-yellow-500/20 text-yellow-200'
                        : rank === 2
                            ? 'border-slate-300/50 bg-slate-400/20 text-slate-200'
                            : rank === 3
                                ? 'border-amber-400/50 bg-amber-500/20 text-amber-200'
                                : 'border-dark-500 bg-dark-700/60 text-dark-200';
                    const badgeText = rank <= 3 ? `TOP ${rank}` : `#${rank}`;
                    return `
                        <div class="rounded-xl border px-3 py-2 ${cardTone}">
                            <div class="flex items-center gap-3">
                                <span class="min-w-[60px] rounded-lg border px-2 py-1 text-center text-[11px] font-extrabold tracking-wide ${badgeTone}">${badgeText}</span>
                                <div class="min-w-0 flex-1">
                                    <p class="truncate text-sm font-semibold text-dark-100">${name}</p>
                                    <p class="text-[11px] text-dark-300">${reachedLevel}/${targetLevel} level • ${score} pts</p>
                                </div>
                                <span class="text-xs font-mono text-accent-300">${formatTime(timeMs)}</span>
                            </div>
                            <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-dark-900/70">
                                <div class="h-full rounded-full bg-gradient-to-r from-accent-400 to-secondary-400" style="width:${progressPercent}%"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        updateClassCompletionProgress();
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

        const emoji = document.getElementById('mp-result-emoji');
        if (emoji) emoji.innerHTML = getResultTrophySvg();

        const detail = document.getElementById('mp-result-detail');
        if (detail) {
            detail.classList.remove('hidden');
        }

        const rankedList = document.getElementById('result-ranked-list');
        if (rankedList) rankedList.classList.remove('hidden');

        const legacy = document.getElementById('legacy-result');
        if (legacy) legacy.classList.add('hidden');

        const status = classBattleSession && classBattleSession.status
            ? classBattleSession.status
            : 'finished';
        const subtitle = document.getElementById('class-session-status');
        if (subtitle && status === 'finished') {
            subtitle.textContent = 'Sesi selesai. Ranking akhir ditampilkan.';
        }

        const playAgainBtn = document.getElementById('mp-btn-play-again');
        if (playAgainBtn) playAgainBtn.classList.add('hidden');
    }

    function hideClassBattleResultPanel() {
        const detail = document.getElementById('mp-result-detail');
        if (detail) detail.classList.remove('hidden');

        const rankedList = document.getElementById('result-ranked-list');
        if (rankedList) rankedList.classList.remove('hidden');

        const legacy = document.getElementById('legacy-result');
        if (legacy) legacy.classList.add('hidden');

        const playAgainBtn = document.getElementById('mp-btn-play-again');
        if (playAgainBtn) playAgainBtn.classList.remove('hidden');
    }

    async function finishClassBattleSession(status) {
        const bridge = getClassBattleBridge();
        if (!bridge || !classBattleSession || !classBattleSession.id) return;
        if (classBattleSession.status === 'finished' || classBattleSession.status === 'cancelled') {
            classBattleActive = false;
            await bridge.refreshRanking().catch(() => {});
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
            stopClassLevelTimer();
            classLevelTimerStartedAt = 0;
            classLevelTimerSeconds = 0;
            classLevelTimerLevel = 1;
            classLevelTimerTargetLevel = 1;
            setClassCountdownLabel('-');
            stopClassParticipantPolling();
            syncLobbyBackButtonState();
            await bridge.refreshRanking().catch(() => {});
            showClassBattleResultModal();
        }
    }

    function handleClassBattleEvent(eventName, payload) {
        if (!eventName) return;

        if (eventName === 'session-timer-started' || eventName === 'first-finish-window-started') {
            const seconds = Math.max(0, Number(payload && payload.seconds) || 0);
            const levelIndex = Math.max(1, Math.floor(Number(payload && payload.levelIndex) || Number(classLevelTimerLevel) || 1));
            const targetLevel = Math.max(
                levelIndex,
                Math.floor(Number(payload && payload.targetLevel) || Number(classBattleSession && classBattleSession.target_level) || levelIndex)
            );

            if (seconds > 0) {
                startClassLevelCountdown({
                    startedAt: payload && payload.startedAt,
                    seconds,
                    levelIndex,
                    targetLevel
                });

                if (classBattleRole === 'guest' && classBattleSession && classBattleSession.mode) {
                    const absoluteLevelFromTimer = Math.max(
                        1,
                        Math.floor(Number(classBattleStartLevel) || 1) + levelIndex - 1
                    );
                    const currentAbsoluteLevel = getCurrentModeLevel(classBattleSession.mode);
                    if (currentAbsoluteLevel < absoluteLevelFromTimer) {
                        setModeLevel(classBattleSession.mode, absoluteLevelFromTimer);
                        if (typeof navigateTo === 'function') {
                            navigateTo(classBattleSession.mode);
                        }
                    }
                }

                setClassSessionStatus(`Timer level ${levelIndex}/${targetLevel} aktif (${seconds} detik).`, false);
            }
            return;
        }

        if (eventName === 'participant-joined') {
            refreshClassParticipants().catch(() => {});
            const joinedName = payload && typeof payload.displayName === 'string'
                ? payload.displayName.trim()
                : '';
            if (joinedName) {
                setClassSessionStatus(`${joinedName} bergabung ke sesi.`, false);
            }
            return;
        }

        if (eventName === 'all-participants-finished') {
            setClassSessionStatus('Semua peserta selesai. Menutup sesi...', false);
            if (classBattleSession && classBattleSession.status === 'in_progress') {
                if (classBattleRole === 'host') {
                    finishClassBattleSession('finished').catch(() => {});
                }
            }
            return;
        }

        if (eventName === 'session-started') {
            classBattleActive = true;
            const mode = (payload && payload.mode) || (classBattleSession && classBattleSession.mode) || 'coding';
            refreshClassParticipants().catch(() => {});

            if (classBattleRole === 'host') {
                setClassSessionStatus('Class battle berjalan. Host sedang memantau progres peserta.', false);
                syncLobbyBackButtonState();
                return;
            }

            const perLevelSeconds = Math.max(1, Math.floor(Number(payload && payload.perLevelSeconds) || getClassBattlePerLevelSeconds(classBattleSession)));
            classLevelTimerSeconds = perLevelSeconds;

            classBattleRoundStartedAt = Date.now();
            ensureClassBattleStartsFromLevelOne(mode);
            classBattleStartLevel = getCurrentModeLevel(mode);
            if (typeof navigateTo === 'function') {
                navigateTo(mode);
            }
            setClassSessionStatus('Class battle dimulai. Menunggu sinkron timer level dari host...', false);
            return;
        }

        if (eventName === 'session-finished') {
            classBattleActive = false;
            if (classBattleSession) {
                classBattleSession.status = (payload && payload.status) || 'finished';
            }
            restoreSavedLevelAfterClassBattle(classBattleSession && classBattleSession.mode);
            stopClassLevelTimer();
            classLevelTimerStartedAt = 0;
            classLevelTimerSeconds = 0;
            classLevelTimerLevel = 1;
            classLevelTimerTargetLevel = 1;
            setClassCountdownLabel('-');
            setClassSessionStatus('Sesi selesai. Menampilkan ranking akhir.', false);
            stopClassParticipantPolling();
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
            stopClassLevelTimer();
            classLevelTimerStartedAt = 0;
            classLevelTimerSeconds = 0;
            classLevelTimerLevel = 1;
            classLevelTimerTargetLevel = 1;
            classBattleParticipantRows = [];
            classBattleRankingRows = [];
            setClassSessionCode('-');
            setClassSessionStatus('Belum terhubung', false);
            setClassCountdownLabel('-');
            renderClassBattleRanking([]);
            renderClassParticipantPreview([]);
            stopClassParticipantPolling();
        } else {
            refreshClassParticipants().catch(() => {});
            startClassParticipantPolling();
            updateClassCompletionProgress();
        }
        setClassSessionPanelVisible(Boolean(classBattleSession));

        const classStartBtn = document.getElementById('class-start-btn');
        if (classStartBtn) {
            const canStartAsHost = classBattleRole === 'host'
                && Boolean(classBattleSession)
                && classBattleSession.status === 'waiting';
            classStartBtn.classList.toggle('hidden', !canStartAsHost);
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
        const perLevelEl = document.getElementById('class-per-level-seconds');

        const hostName = (hostNameEl && hostNameEl.value.trim())
            || (typeof CharacterSystem !== 'undefined' ? CharacterSystem.getPlayerName() : '')
            || 'Host';
        const mode = modeEl ? modeEl.value : 'coding';
        const targetLevel = Math.max(1, Math.floor(Number(targetEl && targetEl.value) || 1));
        const perLevelSeconds = Math.max(10, Math.min(300, Math.floor(Number(perLevelEl && perLevelEl.value) || 20)));

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
                perLevelSeconds,
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
            classBattleStartLevel = 1;
            isHost = true;

            const resolvedSessionCode = classBattleSession && classBattleSession.session_code
                ? classBattleSession.session_code
                : (session && session.session_code);
            if (resolvedSessionCode && classBattleSession && !classBattleSession.session_code) {
                classBattleSession = { ...classBattleSession, session_code: resolvedSessionCode };
            }

            bridge.resetFirstFinishLock();
            bridge.syncSessionMeta({
                session: classBattleSession,
                participant: classBattleParticipant,
                role: 'host'
            });
            await bridge.connectRealtime(classBattleSession.session_code);

            setClassSessionPanelVisible(true);
            setClassSessionCode(resolvedSessionCode || '-');
            setClassSessionStatus('Sesi dibuat. Bagikan kode ke peserta.', false);
            stopClassLevelTimer();
            classLevelTimerStartedAt = 0;
            classLevelTimerSeconds = 0;
            classLevelTimerLevel = 1;
            classLevelTimerTargetLevel = 1;
            setClassCountdownLabel('-');
            setClassCreateStatus('Sesi siap. Tekan "Mulai Class Battle" saat semua peserta sudah masuk.', false);

            const startBtn = document.getElementById('class-start-btn');
            if (startBtn) startBtn.classList.remove('hidden');

            await bridge.refreshRanking().catch(() => {});
            await refreshClassParticipants().catch(() => {});
            startClassParticipantPolling();
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
            classBattleStartLevel = 1;
            isHost = false;

            const resolvedSessionCode = classBattleSession && classBattleSession.session_code
                ? classBattleSession.session_code
                : sessionCode;
            if (resolvedSessionCode && classBattleSession && !classBattleSession.session_code) {
                classBattleSession = { ...classBattleSession, session_code: resolvedSessionCode };
            }

            bridge.resetFirstFinishLock();
            bridge.syncSessionMeta({
                session: classBattleSession,
                participant: classBattleParticipant,
                role: 'guest'
            });
            await bridge.connectRealtime(classBattleSession.session_code);

            setClassSessionPanelVisible(true);
            setClassSessionCode(resolvedSessionCode || '-');
            setClassSessionStatus('Berhasil bergabung. Menunggu host memulai.', false);
            stopClassLevelTimer();
            classLevelTimerStartedAt = 0;
            classLevelTimerSeconds = 0;
            classLevelTimerLevel = 1;
            classLevelTimerTargetLevel = 1;
            setClassCountdownLabel('-');
            setClassJoinStatus(`Bergabung sebagai ${classBattleParticipant.display_name}.`, false);

            const startBtn = document.getElementById('class-start-btn');
            if (startBtn) startBtn.classList.add('hidden');

            await bridge.refreshRanking().catch(() => {});
            await refreshClassParticipants().catch(() => {});
            startClassParticipantPolling();
            await bridge.broadcast('participant-joined', {
                participantId: classBattleParticipant && classBattleParticipant.id,
                displayName: classBattleParticipant && classBattleParticipant.display_name
                    ? classBattleParticipant.display_name
                    : displayName
            }).catch(() => {});

            if (classBattleSession.status === 'in_progress') {
                handleClassBattleEvent('session-started', {
                    mode: classBattleSession.mode,
                    targetLevel: classBattleSession.target_level,
                    perLevelSeconds: getClassBattlePerLevelSeconds(classBattleSession)
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
            classBattleStartLevel = getCurrentModeLevel(classBattleSession.mode);

            const perLevelSeconds = getClassBattlePerLevelSeconds(classBattleSession);
            const targetLevel = Math.max(1, Math.floor(Number(classBattleSession.target_level) || 1));
            classLevelTimerSeconds = perLevelSeconds;
            classLevelTimerTargetLevel = targetLevel;

            bridge.resetFirstFinishLock();
            bridge.syncSessionMeta({
                session: classBattleSession,
                participant: classBattleParticipant,
                role: 'host'
            });

            await bridge.broadcast('session-started', {
                mode: classBattleSession.mode,
                targetLevel: classBattleSession.target_level,
                perLevelSeconds
            });

            await announceClassLevelTimerStart({
                levelIndex: 1,
                targetLevel,
                seconds: perLevelSeconds
            });

            setClassSessionStatus(`Class battle dimulai. Timer per level ${perLevelSeconds} detik.`, false);
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

        // Debounce: ignore rapid-fire calls within 800ms
        if (classBattleSubmitTimer) return;
        classBattleSubmitTimer = setTimeout(() => { classBattleSubmitTimer = null; }, 800);

        try {
            bridge.service.assertSessionOpen(classBattleSession);
        } catch (error) {
            setClassJoinStatus((error && error.message) || 'Sesi class battle sudah ditutup.', true);
            classBattleActive = false;
            return;
        }

        const reachedLevel = toClassBattleProgressLevel(mode, payload && payload.reachedLevel);
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
            const ranking = await bridge.service.fetchRanking({
                sessionId: classBattleSession.id,
                limit: 100
            });
            await bridge.broadcast('ranking-updated', {
                participantId: classBattleParticipant.id
            });

            const allFinished = await areAllBattleParticipantsDone(bridge, targetLevel, ranking);
            if (allFinished) {
                await bridge.broadcast('all-participants-finished', {
                    sessionId: classBattleSession.id
                });
                if (classBattleRole === 'host') {
                    await finishClassBattleSession('finished');
                }
                return;
            }

            setClassSessionStatus(`Progres terkirim (${reachedLevel}/${targetLevel} level).`, false);
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

        // Host: start room-state broadcast interval (clean up old one first)
        if (isHost) {
            if (roomStateInterval) clearInterval(roomStateInterval);
            roomStateInterval = setInterval(broadcastRoomState, 1000);
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
                    readyBtn = `<button onclick="Multiplayer.toggleReady('${p.id}')" class="ml-auto px-2 py-1 text-xs rounded-full ${p.ready ? 'bg-secondary-500 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}">Siap</button>`;
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
            const medal = `#${index + 1}`;
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
                modalTitle.textContent = `Kamu Juara 1! (${formatTime(myTime)})`;
            } else if (myRank > -1) {
                modalTitle.textContent = `Kamu Peringkat ${myRank + 1}!`;
            } else {
                modalTitle.textContent = 'Hasil Pertandingan';
            }
        }

        const emoji = document.getElementById('mp-result-emoji');
        if (emoji) emoji.innerHTML = getResultTrophySvg();

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
        const me = roomPlayers.find(p => p.isMe);
        if (me) me.completedTime = myTime;
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
        if (roomStateInterval) { clearInterval(roomStateInterval); roomStateInterval = null; }
        if (classBattleSubmitTimer) { clearTimeout(classBattleSubmitTimer); classBattleSubmitTimer = null; }
        if (conn) { try { conn.close(); } catch(e) {} conn = null; }
        if (peer) { try { peer.destroy(); } catch(e) {} peer = null; }

        opponentCompleted = false;
        opponentTime = 0;
        opponentCharacter = null;

        if (classBattleBridge && typeof classBattleBridge.dispose === 'function') {
            classBattleBridge.dispose().catch(() => {});
        }
        classBattleBridge = null;
        classBattleSession = null;
        classBattleParticipant = null;
        classBattleRole = 'guest';
        classBattleActive = false;
        classBattleRoundStartedAt = 0;
        classBattleStartLevel = 1;
        stopClassLevelTimer();
        classLevelTimerStartedAt = 0;
        classLevelTimerSeconds = 0;
        classLevelTimerLevel = 1;
        classLevelTimerTargetLevel = 1;
        restoreAllSavedLevelsAfterClassBattle();
        stopClassParticipantPolling();
        classBattleParticipantRows = [];
        classBattleRankingRows = [];

        setClassSessionPanelVisible(false);
        setClassSessionCode('-');
        setClassSessionStatus('Belum terhubung', false);
        setClassCountdownLabel('-');
        renderClassParticipantPreview([]);
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
