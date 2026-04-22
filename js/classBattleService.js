/**
 * Supabase service untuk class battle guest.
 */
(function (globalScope) {
    function loadRules(globalRef) {
        if (globalRef && globalRef.ClassBattleRules) return globalRef.ClassBattleRules;
        if (typeof require === 'function') {
            try {
                return require('./classBattleRules.js');
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    const rules = loadRules(globalScope) || {
        rankSubmissions(rows) { return Array.isArray(rows) ? [...rows] : []; },
        resolveDuplicateDisplayName(existingNames, rawName) {
            const base = String(rawName || '').trim() || 'Peserta';
            const normalized = base.toLowerCase();
            let suffix = 1;
            while (existingNames.has(`${normalized}#${suffix}`)) suffix += 1;
            return {
                displayName: suffix === 1 ? base : `${base} #${suffix}`,
                normalized,
                suffix
            };
        }
    };

    const DEFAULT_TABLES = {
        sessions: 'guest_sessions',
        participants: 'guest_participants',
        submissions: 'guest_submissions'
    };

    function toError(errorLike, fallbackMessage) {
        if (errorLike instanceof Error) return errorLike;
        const message = (errorLike && errorLike.message) || fallbackMessage;
        const error = new Error(message);
        error.cause = errorLike;
        return error;
    }

    function toResult(rawResult) {
        if (rawResult && typeof rawResult === 'object' && ('data' in rawResult || 'error' in rawResult)) {
            return rawResult;
        }
        return { data: rawResult, error: null };
    }

    function toSafeString(value) {
        return typeof value === 'string' ? value.trim() : '';
    }

    function randomCode() {
        return String(Math.floor(100000 + Math.random() * 900000));
    }

    function randomToken() {
        return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    function createClassBattleService(supabaseClient, options) {
        const client = supabaseClient;
        const opt = options && typeof options === 'object' ? options : {};
        const tables = { ...DEFAULT_TABLES, ...(opt.tables || {}) };
        const defaultCountdown = Math.max(1, Math.floor(Number(opt.countdownSeconds) || 10));
        const channelPrefix = toSafeString(opt.realtimeChannelPrefix) || 'kelas-room';

        function assertClient() {
            if (!client || typeof client.from !== 'function') {
                throw new Error('Supabase client tidak tersedia.');
            }
        }

        function applySelectSingle(query, maybeSingle) {
            let chain = query;
            if (chain && typeof chain.select === 'function') {
                chain = chain.select('*');
            }
            if (maybeSingle && chain && typeof chain.maybeSingle === 'function') {
                chain = chain.maybeSingle();
            } else if (chain && typeof chain.single === 'function') {
                chain = chain.single();
            }
            return chain;
        }

        async function run(query, fallbackMessage) {
            const result = toResult(await query);
            if (result.error) throw toError(result.error, fallbackMessage);
            return result.data;
        }

        function assertSessionOpen(session) {
            if (!session || session.status === 'finished' || session.status === 'cancelled') {
                throw new Error('Sesi sudah ditutup');
            }
        }

        async function createSession({ hostName, mode, targetLevel, maxParticipants }) {
            assertClient();

            const payload = {
                session_code: randomCode(),
                host_name: toSafeString(hostName) || 'Host',
                host_token: randomToken(),
                mode: toSafeString(mode) || 'coding',
                target_level: Math.max(1, Math.floor(Number(targetLevel) || 1)),
                max_participants: Math.max(2, Math.min(30, Math.floor(Number(maxParticipants) || 30))),
                status: 'waiting',
                finish_countdown_seconds: defaultCountdown
            };

            const query = applySelectSingle(client.from(tables.sessions).insert([payload]), false);
            const data = await run(query, 'Gagal membuat sesi class battle.');
            if (Array.isArray(data)) return data[0];
            return data || payload;
        }

        async function getSessionByCode(sessionCode) {
            assertClient();
            const code = toSafeString(sessionCode);
            if (!code) return null;

            let query = client.from(tables.sessions).select('*').eq('session_code', code);
            query = applySelectSingle(query, true);
            const data = await run(query, 'Gagal mengambil sesi class battle.');
            return data || null;
        }

        async function listParticipants(sessionId) {
            assertClient();
            let query = client.from(tables.participants).select('*').eq('session_id', sessionId);
            if (query && typeof query.order === 'function') {
                query = query.order('joined_at', { ascending: true });
            }
            const data = await run(query, 'Gagal mengambil daftar peserta.');
            return Array.isArray(data) ? data : [];
        }

        function buildNameRegistry(participants) {
            const set = new Set();
            (participants || []).forEach((item) => {
                const normalized = toSafeString(item && item.normalized_name).toLowerCase();
                const suffix = Math.max(1, Math.floor(Number(item && item.name_suffix) || 1));
                if (!normalized) return;
                set.add(`${normalized}#${suffix}`);
            });
            return set;
        }

        async function joinSession({ sessionCode, displayName, playerToken, isHost }) {
            assertClient();
            const session = await getSessionByCode(sessionCode);
            if (!session) throw new Error('Sesi tidak ditemukan.');
            assertSessionOpen(session);

            const participants = await listParticipants(session.id);
            const maxParticipants = Math.max(2, Math.floor(Number(session.max_participants) || 30));
            if (participants.length >= maxParticipants) {
                throw new Error('Sesi sudah penuh.');
            }

            const registry = buildNameRegistry(participants);
            const nameMeta = rules.resolveDuplicateDisplayName(registry, displayName);
            const payload = {
                session_id: session.id,
                display_name: nameMeta.displayName,
                normalized_name: nameMeta.normalized,
                name_suffix: nameMeta.suffix,
                player_token: toSafeString(playerToken) || randomToken(),
                is_host: Boolean(isHost)
            };

            const query = applySelectSingle(client.from(tables.participants).insert([payload]), false);
            const data = await run(query, 'Gagal bergabung ke sesi class battle.');
            return {
                session,
                participant: Array.isArray(data) ? data[0] : (data || payload)
            };
        }

        async function startSession({ sessionId, hostToken }) {
            assertClient();
            let query = client.from(tables.sessions)
                .update({ status: 'in_progress', started_at: new Date().toISOString() })
                .eq('id', sessionId)
                .eq('host_token', toSafeString(hostToken));
            query = applySelectSingle(query, false);
            return run(query, 'Gagal memulai sesi class battle.');
        }

        async function startFirstFinishWindow({ sessionId, countdownSeconds }) {
            assertClient();
            const seconds = Math.max(1, Math.min(60, Math.floor(Number(countdownSeconds) || defaultCountdown)));
            const payload = {
                first_finish_started_at: new Date().toISOString(),
                finish_countdown_seconds: seconds
            };

            let query = client.from(tables.sessions)
                .update(payload)
                .eq('id', sessionId)
                .eq('status', 'in_progress');

            if (query && typeof query.is === 'function') {
                query = query.is('first_finish_started_at', null);
            }

            query = applySelectSingle(query, true);
            return run(query, 'Gagal memulai countdown sesi.');
        }

        async function finishSession({ sessionId, status }) {
            assertClient();
            const endedAt = new Date();
            const cleanupAt = new Date(endedAt.getTime() + (10 * 60 * 1000));

            let query = client.from(tables.sessions)
                .update({
                    status: toSafeString(status) || 'finished',
                    ended_at: endedAt.toISOString(),
                    cleanup_at: cleanupAt.toISOString()
                })
                .eq('id', sessionId);

            query = applySelectSingle(query, false);
            return run(query, 'Gagal menutup sesi class battle.');
        }

        async function fetchRanking({ sessionId, limit }) {
            assertClient();

            let query = client.from(tables.submissions)
                .select('*')
                .eq('session_id', sessionId);

            if (query && typeof query.order === 'function') {
                query = query
                    .order('score', { ascending: false })
                    .order('time_ms', { ascending: true })
                    .order('submitted_at', { ascending: true });
            }

            if (query && typeof query.limit === 'function') {
                query = query.limit(Math.max(1, Math.min(100, Math.floor(Number(limit) || 30))));
            }

            const submissions = await run(query, 'Gagal mengambil ranking class battle.');
            const rows = Array.isArray(submissions) ? submissions : [];

            const participants = await listParticipants(sessionId);
            const participantMap = new Map(participants.map((item) => [item.id, item.display_name]));

            const normalizedRows = rows.map((row) => ({
                ...row,
                timeMs: row.time_ms,
                submittedAt: row.submitted_at,
                participantName: participantMap.get(row.participant_id) || row.display_name || 'Peserta'
            }));

            return rules.rankSubmissions(normalizedRows)
                .map((row, index) => ({ ...row, rank: index + 1 }));
        }

        async function submitResultWithRetry({ sessionId, participantId, reachedLevel, score, timeMs }) {
            assertClient();

            const payload = {
                session_id: sessionId,
                participant_id: participantId,
                reached_level: Math.max(1, Math.floor(Number(reachedLevel) || 1)),
                score: Math.max(0, Math.floor(Number(score) || 0)),
                time_ms: Math.max(0, Math.floor(Number(timeMs) || 0)),
                submitted_at: new Date().toISOString()
            };

            let lastError = null;

            for (let attempt = 0; attempt < 2; attempt += 1) {
                let query = client.from(tables.submissions)
                    .upsert(payload, { onConflict: 'session_id,participant_id' });

                query = applySelectSingle(query, false);

                const result = toResult(await query);
                if (!result.error) {
                    return Array.isArray(result.data) ? result.data[0] : (result.data || payload);
                }

                lastError = result.error;
            }

            throw toError(lastError, 'Gagal mengirim hasil. Coba lagi.');
        }

        function createSessionChannel(sessionCode, handlers) {
            if (!client || typeof client.channel !== 'function') return null;

            const code = toSafeString(sessionCode);
            if (!code) return null;

            const channel = client.channel(`${channelPrefix}:${code}`, {
                config: {
                    broadcast: {
                        ack: true,
                        self: false
                    }
                }
            });

            const eventNames = [
                'session-started',
                'first-finish-window-started',
                'session-finished',
                'ranking-updated'
            ];

            eventNames.forEach((eventName) => {
                channel.on('broadcast', { event: eventName }, (payload) => {
                    if (handlers && typeof handlers.onBroadcast === 'function') {
                        handlers.onBroadcast(eventName, payload && payload.payload ? payload.payload : payload);
                    }
                });
            });

            channel.subscribe((status) => {
                if (handlers && typeof handlers.onStatus === 'function') {
                    handlers.onStatus(status);
                }
            });

            return channel;
        }

        async function sendSessionEvent(channel, eventName, payload) {
            if (!channel || typeof channel.send !== 'function') return null;
            return channel.send({
                type: 'broadcast',
                event: eventName,
                payload: payload || {}
            });
        }

        async function removeSessionChannel(channel) {
            if (!channel || !client || typeof client.removeChannel !== 'function') return null;
            return client.removeChannel(channel);
        }

        return {
            createSession,
            getSessionByCode,
            listParticipants,
            joinSession,
            startSession,
            startFirstFinishWindow,
            finishSession,
            fetchRanking,
            submitResultWithRetry,
            assertSessionOpen,
            createSessionChannel,
            sendSessionEvent,
            removeSessionChannel
        };
    }

    const api = { createClassBattleService };
    globalScope.ClassBattleService = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
