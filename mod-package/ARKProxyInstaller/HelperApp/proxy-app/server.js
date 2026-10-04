const express = require('express');
const fs = require('fs');
const path = require('path');
const { APP_PORT, APP_NAME, ADMIN_PASSWORD, LOG_DIR, DATABASE_DIR } = require('./config');
const SessionManager = require('./modules/session-manager');
const WhitelistManager = require('./modules/whitelist-manager');
const BanManager = require('./modules/ban-manager');
const JailManager = require('./modules/jail-manager');
const PlayerTracker = require('./modules/player-tracker');
const AuthManager = require('./modules/auth');

const app = express();
app.use(express.json());

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
if (!fs.existsSync(DATABASE_DIR)) fs.mkdirSync(DATABASE_DIR, { recursive: true });

const sessionMgr = new SessionManager();
const whitelistMgr = new WhitelistManager();
const banMgr = new BanManager();
const jailMgr = new JailManager();
const playerTracker = new PlayerTracker();
const authMgr = new AuthManager();

function logActivity(action, details) {
  const logPath = path.join(LOG_DIR, 'activity.log');
  const entry = `[${new Date().toISOString()}] ${action}: ${JSON.stringify(details)}\n`;
  fs.appendFileSync(logPath, entry);
}

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: APP_NAME, uptime: process.uptime() });
});

app.post('/api/join-code', (req, res) => {
  const code = sessionMgr.generateJoinCode();
  const sessionId = sessionMgr.createSession(code, req.body?.server || 'default');
  res.json({ ok: true, code, sessionId, expiresIn: 900 });
});

app.post('/api/join/validate', (req, res) => {
  const { code, playerId, playerName } = req.body || {};
  if (!code || !playerId || !playerName) {
    return res.status(400).json({ error: 'Missing code, playerId, or playerName' });
  }

  const session = sessionMgr.validateJoinCode(code);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired code' });
  }

  if (banMgr.isBanned(playerId)) {
    return res.status(403).json({ error: 'Player is banned' });
  }

  if (!whitelistMgr.isWhitelisted(playerId)) {
    return res.status(403).json({ error: 'Player not whitelisted' });
  }

  if (jailMgr.getJailZone(playerId)) {
    return res.status(403).json({ error: 'Player is jailed' });
  }

  const token = authMgr.createToken(playerId);
  playerTracker.logLogin(playerId, playerName, session.server);
  res.json({ ok: true, allowed: true, sessionId: session.id, token, server: session.server });
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  res.json({
    ok: true,
    stats: {
      onlinePlayers: playerTracker.getOnlinePlayers().length,
      totalBans: banMgr.getAll().length,
      totalWhitelisted: whitelistMgr.getAll().length,
      activeSessions: sessionMgr.getAll().length
    }
  });
});

app.get('/api/admin/players', requireAdmin, (req, res) => {
  res.json({ ok: true, players: playerTracker.getAll() });
});

app.get('/api/admin/whitelist', requireAdmin, (req, res) => {
  res.json({ ok: true, whitelist: whitelistMgr.getAll() });
});

app.post('/api/admin/whitelist/add', requireAdmin, (req, res) => {
  const { playerId, playerName, tier } = req.body || {};
  whitelistMgr.addPlayer(playerId, playerName, tier || 'guest');
  res.json({ ok: true, added: true });
});

app.post('/api/admin/whitelist/remove', requireAdmin, (req, res) => {
  const { playerId } = req.body || {};
  whitelistMgr.removePlayer(playerId);
  res.json({ ok: true, removed: true });
});

app.get('/api/admin/bans', requireAdmin, (req, res) => {
  res.json({ ok: true, bans: banMgr.getAll() });
});

app.post('/api/admin/ban/add', requireAdmin, (req, res) => {
  const { playerId, playerName, reason, duration } = req.body || {};
  banMgr.banPlayer(playerId, playerName, reason, duration || 0);
  res.json({ ok: true, banned: true });
});

app.post('/api/admin/ban/remove', requireAdmin, (req, res) => {
  const { playerId } = req.body || {};
  banMgr.unbanPlayer(playerId);
  res.json({ ok: true, removed: true });
});

app.get('/api/admin/jail', requireAdmin, (req, res) => {
  res.json({ ok: true, jailed: jailMgr.getAll() });
});

app.post('/api/admin/jail/set', requireAdmin, (req, res) => {
  const { playerId, zone } = req.body || {};
  jailMgr.jailPlayer(playerId, zone);
  res.json({ ok: true, jailed: true });
});

app.post('/api/admin/jail/release', requireAdmin, (req, res) => {
  const { playerId } = req.body || {};
  jailMgr.releasePlayer(playerId);
  res.json({ ok: true, released: true });
});

app.get('/api/admin/logs', requireAdmin, (req, res) => {
  const logFile = path.join(LOG_DIR, 'activity.log');
  if (!fs.existsSync(logFile)) return res.json({ ok: true, logs: [] });
  const logs = fs.readFileSync(logFile, 'utf-8').split('\n').filter(Boolean).slice(-100);
  res.json({ ok: true, logs });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(APP_PORT, () => {
  console.log(`${APP_NAME} running on port ${APP_PORT}`);
  console.log(`Web UI: http://localhost:${APP_PORT}`);
  console.log(`Admin UI: http://localhost:${APP_PORT}/admin`);
});
