const http = require('http');
const express = require('express');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');

const PORT = Number(process.env.PORT || 10000);
const PEER_PATH_RAW = process.env.PEER_PATH || '/peerjs';
const PEER_PATH = PEER_PATH_RAW.startsWith('/') ? PEER_PATH_RAW : `/${PEER_PATH_RAW}`;
const ALLOWED_ORIGINS_RAW = process.env.CORS_ALLOWED_ORIGINS || '*';
const ALLOWED_ORIGINS = ALLOWED_ORIGINS_RAW.split(',').map((origin) => origin.trim()).filter(Boolean);

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);

if (ALLOWED_ORIGINS.includes('*')) {
    app.use(cors({ origin: true, credentials: false }));
} else {
    app.use(cors({
        origin(origin, callback) {
            if (!origin || ALLOWED_ORIGINS.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error('Origin not allowed by CORS'));
        },
        credentials: false
    }));
}

app.get('/healthz', (_req, res) => {
    res.status(200).json({ ok: true });
});

app.get('/', (_req, res) => {
    res.status(200).json({
        ok: true,
        service: 'game-edukasi-peer-server',
        peerPath: PEER_PATH
    });
});

const server = http.createServer(app);
const peerServer = ExpressPeerServer(server, {
    path: '/',
    proxied: true,
    allow_discovery: false
});

app.use(PEER_PATH, peerServer);

server.listen(PORT, () => {
    console.log(`[peer-server] listening on :${PORT} path=${PEER_PATH}`);
});
