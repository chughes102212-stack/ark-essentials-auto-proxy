const express = require('express');
const { APP_PORT, APP_NAME, JOIN_CODE_TTL } = require('./config');

const app = express();
app.use(express.json());

const sessions = new Map();

function generateJoinCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

app.get('/health', (req, res) => {
  res.json({ ok: true, app: APP_NAME, uptime: process.uptime() });
});

app.post('/join-code', (req, res) => {
  const code = generateJoinCode();
  const expiry = Date.now() + (JOIN_CODE_TTL * 1000);

  sessions.set(code, {
    createdAt: Date.now(),
    expiresAt: expiry,
    players: [],
    server: req.body?.server || 'default'
  });

  res.json({ ok: true, code, expiresAt: expiry });
});

app.post('/session/start', (req, res) => {
  const { sessionId, server } = req.body || {};
  res.json({ ok: true, sessionId, server, started: true });
});

app.post('/session/end', (req, res) => {
  const { sessionId } = req.body || {};
  res.json({ ok: true, sessionId, ended: true });
});

app.post('/player/heartbeat', (req, res) => {
  const { playerId, state } = req.body || {};
  res.json({ ok: true, playerId, state, received: true });
});

app.listen(APP_PORT, () => {
  console.log(`${APP_NAME} running on port ${APP_PORT}`);
});
