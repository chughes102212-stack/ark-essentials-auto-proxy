const express = require('express');
const path = require('path');
const fs = require('fs');
const { APP_PORT, APP_NAME, ADMIN_PASSWORD, LOG_DIR, DATABASE_DIR } = require('./config');
const SessionManager = require('./modules/session-manager');
const WhitelistManager = require('./modules/whitelist-manager');
const BanManager = require('./modules/ban-manager');
const JailManager = require('./modules/jail-manager');
const PlayerTracker = require('./modules/player-tracker');
const AuthManager = require('./modules/auth');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure directories exist
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
if (!fs.existsSync(DATABASE_DIR)) fs.mkdirSync(DATABASE_DIR, { recursive: true });

const sessionMgr = new SessionManager();
const whitelistMgr = new WhitelistManager();
const banMgr = new BanManager();
const jailMgr = new JailManager();
const playerTracker = new PlayerTracker();
const authMgr = new AuthManager();

function logActivity(action, details) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${action}: ${JSON.stringify(details)}\n`;
  fs.appendFileSync(path.join(LOG_DIR, 'activity.log'), logEntry);
  console.log(logEntry);
}

// Middleware: Admin auth
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ========== PUBLIC API ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: APP_NAME, uptime: process.uptime(), version: '2.0.0' });
});

// Generate join code (public)
app.post('/api/join-code', (req, res) => {
  const { server } = req.body || {};
  const code = sessionMgr.generateJoinCode();
  const sessionId = sessionMgr.createSession(code, server || 'default');
  
  logActivity('JOIN_CODE_GENERATED', { code, server, sessionId });

  res.json({ ok: true, code, sessionId, expiresIn: 900 });
});

// Validate join code and authenticate player (public)
app.post('/api/join/validate', (req, res) => {
  const { code, playerId, playerName } = req.body || {};

  if (!code || !playerId || !playerName) {
    return res.status(400).json({ error: 'Missing code, playerId, or playerName' });
  }

  // Check if code is valid
  const session = sessionMgr.validateJoinCode(code);
  if (!session) {
    logActivity('JOIN_FAILED', { reason: 'INVALID_CODE', playerId });
    return res.status(401).json({ error: 'Invalid or expired code' });
  }

  // Check if player is banned
  if (banMgr.isBanned(playerId)) {
    const ban = banMgr.getBan(playerId);
    logActivity('JOIN_FAILED', { reason: 'BANNED', playerId, banReason: ban.reason });
    return res.status(403).json({ error: 'Player is banned', reason: ban.reason });
  }

  // Check whitelist
  if (!whitelistMgr.isWhitelisted(playerId)) {
    logActivity('JOIN_FAILED', { reason: 'NOT_WHITELISTED', playerId });
    return res.status(403).json({ error: 'Player not whitelisted' });
  }

  // Check jail status
  const jailZone = jailMgr.getJailZone(playerId);
  if (jailZone) {
    logActivity('JOIN_FAILED', { reason: 'JAILED', playerId, zone: jailZone.name });
    return res.status(403).json({ error: 'Player is jailed', zone: jailZone });
  }

  // Create auth token
  const token = authMgr.createToken(playerId);

  // Track login
  playerTracker.logLogin(playerId, playerName, session.server);
  logActivity('JOIN_SUCCESS', { playerId, playerName, server: session.server });

  res.json({ ok: true, allowed: true, sessionId: session.id, token, server: session.server });
});

// Player heartbeat (public)
app.post('/api/player/heartbeat', (req, res) => {
  const { playerId, state } = req.body || {};
  playerTracker.recordHeartbeat(playerId, state);
  res.json({ ok: true, received: true });
});

// Player logout (public)
app.post('/api/player/logout', (req, res) => {
  const { playerId } = req.body || {};
  playerTracker.logLogout(playerId);
  logActivity('PLAYER_LOGOUT', { playerId });
  res.json({ ok: true, logged: true });
});

// ========== ADMIN API ==========

// Get dashboard stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const players = playerTracker.getOnlinePlayers();
  const bans = banMgr.getAll();
  const whitelist = whitelistMgr.getAll();
  const sessions = sessionMgr.getAll();

  res.json({
    ok: true,
    stats: {
      onlinePlayers: players.length,
      totalBans: bans.length,
      totalWhitelisted: whitelist.length,
      activeSessions: sessions.length
    },
    players,
    sessions
  });
});

// Whitelist management
app.post('/api/admin/whitelist/add', requireAdmin, (req, res) => {
  const { playerId, playerName, tier } = req.body || {};
  whitelistMgr.addPlayer(playerId, playerName, tier || 'guest');
  logActivity('WHITELIST_ADD', { playerId, playerName, tier });
  res.json({ ok: true, added: true, playerId });
});

app.post('/api/admin/whitelist/remove', requireAdmin, (req, res) => {
  const { playerId } = req.body || {};
  whitelistMgr.removePlayer(playerId);
  logActivity('WHITELIST_REMOVE', { playerId });
  res.json({ ok: true, removed: true, playerId });
});

app.get('/api/admin/whitelist', requireAdmin, (req, res) => {
  const whitelist = whitelistMgr.getAll();
  res.json({ ok: true, whitelist });
});

// Ban management
app.post('/api/admin/ban/add', requireAdmin, (req, res) => {
  const { playerId, playerName, reason, duration } = req.body || {};
  banMgr.banPlayer(playerId, playerName, reason, duration);
  logActivity('BAN_ADD', { playerId, playerName, reason, duration });
  res.json({ ok: true, banned: true, playerId });
});

app.post('/api/admin/ban/remove', requireAdmin, (req, res) => {
  const { playerId } = req.body || {};
  banMgr.unbanPlayer(playerId);
  logActivity('BAN_REMOVE', { playerId });
  res.json({ ok: true, unbanned: true, playerId });
});

app.get('/api/admin/bans', requireAdmin, (req, res) => {
  const bans = banMgr.getAll();
  res.json({ ok: true, bans });
});

// Jail management
app.post('/api/admin/jail/set', requireAdmin, (req, res) => {
  const { playerId, zone } = req.body || {};
  jailMgr.jailPlayer(playerId, zone);
  logActivity('JAIL_SET', { playerId, zone });
  res.json({ ok: true, jailed: true, playerId, zone });
});

app.post('/api/admin/jail/release', requireAdmin, (req, res) => {
  const { playerId } = req.body || {};
  jailMgr.releasePlayer(playerId);
  logActivity('JAIL_RELEASE', { playerId });
  res.json({ ok: true, released: true, playerId });
});

// Player management
app.get('/api/admin/players', requireAdmin, (req, res) => {
  const players = playerTracker.getAll();
  res.json({ ok: true, players });
});

app.get('/api/admin/players/online', requireAdmin, (req, res) => {
  const players = playerTracker.getOnlinePlayers();
  res.json({ ok: true, players });
});

// Activity logs
app.get('/api/admin/logs', requireAdmin, (req, res) => {
  const logPath = path.join(LOG_DIR, 'activity.log');
  if (!fs.existsSync(logPath)) {
    return res.json({ ok: true, logs: [] });
  }

  const logs = fs.readFileSync(logPath, 'utf-8').split('\n').filter(l => l).slice(-100);
  res.json({ ok: true, logs });
});

// Serve static files and SPA fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(APP_PORT, () => {
  logActivity('SERVER_START', { app: APP_NAME, version: '2.0.0', port: APP_PORT });
  console.log(`${APP_NAME} v2.0 running on port ${APP_PORT}`);
  console.log(`  Web Join: http://localhost:${APP_PORT}`);
  console.log(`  Admin Panel: http://localhost:${APP_PORT}/admin`);
});
