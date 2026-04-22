/**
 * DEMO Class Battle Service - Local mock untuk testing tanpa Supabase.
 * Simulates room creation/join/ranking/timer. Uses localStorage.
 * Supports single browser multi-tab testing (Host + Guest).
 */
(function (globalScope) {
    const SESSIONS_KEY = 'demoClassBattle_sessions';
    const PARTICIPANTS_KEY_PREFIX = 'demoClassBattle_participants_';
    const SUBMISSIONS_KEY_PREFIX = 'demoClassBattle_submissions_';
    
    let demoSessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
    let demoCountdownInterval = null;
    
    // Auto-clean expired sessions
    function cleanupExpired() {
        const now = Date.now();
        demoSessions = demoSessions.filter(s => !s.cleanup_at || new Date(s.cleanup_at).getTime() > now);
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(demoSessions));
    }
    
    function randomId() {
        return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    
    function randomCode() {
        return String(Math.floor(100000 + Math.random() * 900000));
    }
    
    function formatTime(ms) {
        const s = Math.floor(ms / 1000);
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }
    
    function createDemoService(options = {}) {
        cleanupExpired();
        
        return {
            createSession({ hostName, mode, targetLevel, maxParticipants = 30 }) {
                const session = {
                    id: randomId(),
                    session_code: randomCode(),
                    host_name: hostName || 'Demo Host',
                    host_token: randomId(),
                    mode: mode || 'coding',
                    target_level: Math.max(1, targetLevel || 1),
                    max_participants: Math.max(2, maxParticipants),
                    status: 'waiting',
                    started_at: null,
                    ended_at: null,
                    cleanup_at: null,
                    participants: [],
                    rankings: []
                };
                demoSessions.push(session);
                localStorage.setItem(SESSIONS_KEY, JSON.stringify(demoSessions));
                return session;
            },
            
            getSessionByCode(sessionCode) {
                return demoSessions.find(s => s.session_code === sessionCode) || null;
            },
            
            listParticipants(sessionId) {
                const key = PARTICIPANTS_KEY_PREFIX + sessionId;
                return JSON.parse(localStorage.getItem(key) || '[]');
            },
            
            async joinSession({ sessionCode, displayName, playerToken, isHost }) {
                const session = this.getSessionByCode(sessionCode);
                if (!session) throw new Error('Sesi tidak ditemukan.');
                
                const participants = this.listParticipants(session.id);
                if (participants.length >= session.max_participants) {
                    throw new Error('Sesi penuh (max ' + session.max_participants + ')');
                }
                
                const participant = {
                    id: randomId(),
                    session_id: session.id,
                    display_name: displayName || 'Demo Player',
                    normalized_name: displayName?.toLowerCase().trim() || 'player',
                    name_suffix: 1,
                    player_token: playerToken || randomId(),
                    is_host: !!isHost,
                    joined_at: new Date().toISOString()
                };
                
                participants.push(participant);
                localStorage.setItem(PARTICIPANTS_KEY_PREFIX + session.id, JSON.stringify(participants));
                session.participants = participants;
                
                return { session, participant };
            },
            
            async startSession({ sessionId, hostToken }) {
                const idx = demoSessions.findIndex(s => s.id === sessionId);
                if (idx === -1) throw new Error('Sesi tidak ditemukan.');
                
                const session = demoSessions[idx];
                if (session.status !== 'waiting') throw new Error('Sesi sudah dimulai.');
                
                demoSessions[idx] = {
                    ...session,
                    status: 'in_progress',
                    started_at: new Date().toISOString()
                };
                localStorage.setItem(SESSIONS_KEY, JSON.stringify(demoSessions));
                return demoSessions[idx];
            },
            
            startFirstFinishWindow({ sessionId, countdownSeconds = 10 }) {
                const idx = demoSessions.findIndex(s => s.id === sessionId);
                if (idx === -1) return null;
                
                const session = demoSessions[idx];
                const now = new Date().toISOString();
                const seconds = Math.max(1, countdownSeconds);
                
                demoSessions[idx] = {
                    ...session,
                    first_finish_started_at: now,
                    finish_countdown_seconds: seconds
                };
                localStorage.setItem(SESSIONS_KEY, JSON.stringify(demoSessions));
                
                // Simulate tick
                let left = seconds;
                if (demoCountdownInterval) clearInterval(demoCountdownInterval);
                demoCountdownInterval = setInterval(() => {
                    left -= 1;
                    if (left <= 0) {
                        clearInterval(demoCountdownInterval);
                        // Lock session
                        demoSessions[idx].status = 'finished';
                        localStorage.setItem(SESSIONS_KEY, JSON.stringify(demoSessions));
                    }
                }, 1000);
                
                return demoSessions[idx];
            },
            
            finishSession({ sessionId, status = 'finished' }) {
                const idx = demoSessions.findIndex(s => s.id === sessionId);
                if (idx === -1) return null;
                
                const now = new Date();
                const cleanupAt = new Date(now.getTime() + 10 * 60 * 1000);
                
                demoSessions[idx] = {
                    ...demoSessions[idx],
                    status,
                    ended_at: now.toISOString(),
                    cleanup_at: cleanupAt.toISOString()
                };
                localStorage.setItem(SESSIONS_KEY, JSON.stringify(demoSessions));
                return demoSessions[idx];
            },
            
            fetchRanking({ sessionId, limit = 30 }) {
                const key = SUBMISSIONS_KEY_PREFIX + sessionId;
                const submissions = JSON.parse(localStorage.getItem(key) || '[]');
                
                // Mock ranking logic: faster time + higher level = better score
                const ranked = submissions
                    .map(s => ({
                        ...s,
                        timeMs: s.time_ms,
                        score: Math.floor((s.reached_level * 1000) + (60000 / Math.max(1, s.time_ms || 60000)))
                    }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, limit)
                    .map((s, i) => ({ ...s, rank: i + 1 }));
                
                return ranked;
            },
            
            assertSessionOpen(session) {
                if (!session || session.status === 'finished' || session.status === 'cancelled') {
                    throw new Error('Sesi sudah ditutup');
                }
            },
            
            submitResultWithRetry({ sessionId, participantId, reachedLevel, score, timeMs }) {
                const key = SUBMISSIONS_KEY_PREFIX + sessionId;
                const submissions = JSON.parse(localStorage.getItem(key) || '[]');
                
                const submission = {
                    session_id: sessionId,
                    participant_id: participantId,
                    reached_level: Math.max(1, reachedLevel || 1),
                    score: Math.max(0, score || 0),
                    time_ms: Math.max(0, timeMs || 0),
                    submitted_at: new Date().toISOString()
                };
                
                // Upsert logic
                const idx = submissions.findIndex(s => s.participant_id === participantId);
                if (idx > -1) {
                    submissions[idx] = submission;
                } else {
                    submissions.push(submission);
                }
                
                localStorage.setItem(key, JSON.stringify(submissions));
                return submission;
            }
        };
    }
    
    globalScope.DemoClassBattleService = { createDemoService };
})(window);

