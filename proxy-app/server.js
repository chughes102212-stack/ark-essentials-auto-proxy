const express = require('express');
const { APP_PORT, APP_NAME, JOIN_CODE_TTL, ADMIN_PASSWORD } = require('./config');
const SessionManager = require('./modules/session-manager');
const WhitelistManager = require('./modules/whitelist-manager');
const BanManager = require('./modules/ban-manager');
const JailManager = require('./modules/jail-manager');
const PlayerTracker = require('./modules/player-tracker');

const app = express();
app.use(express.json());

const sessionMgr = new SessionManager();
const whitelistMgr = new WhitelistManager();
const banMgr = new BanManager();
const jailMgr = new JailManager();
const playerTracker = new PlayerTracker();

// Middleware: Admin auth
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, app: APP_NAME, uptime: process.uptime() });
});

// Generate join code
app.post('/join-code', (req, res) => {
  const { server, createdBy } = req.body || {};
  const code = sessionMgr.generateJoinCode();
  const sessionId = sessionMgr.createSession(code, server || 'default');

  res.json({ ok: true, code, sessionId, expiresIn: JOIN_CODE_TTL });
});

// Validate join code and authenticate player
app.post('/join/validate', (req, res) => {
  const { code, playerId, playerName } = req.body || {};

  if (!code || !playerId || !playerName) {
    return res.status(400).json({ error: 'Missing code, playerId, or playerName' });
  }

  // Check if code is valid
  const session = sessionMgr.validateJoinCode(code);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired code' });
  }

  // Check if player is banned
  if (banMgr.isBanned(playerId)) {
    const ban = banMgr.getBan(playerId);
    return res.status(403).json({ error: 'Player is banned', reason: ban.reason });
  }

  // Check whitelist
  if (!whitelistMgr.isWhitelisted(playerId)) {
    return res.status(403).json({ error: 'Player not whitelisted' });
  }

  // Check jail status
  const jailZone = jailMgr.getJailZone(playerId);
  if (jailZone) {
    return res.status(403).json({ error: 'Player is jailed', zone: jailZone });
  }

  // Track login
  playerTracker.logLogin(playerId, playerName, session.server);

  res.json({ ok: true, allowed: true, sessionId: session.id });
});

// Whitelist management
app.post('/admin/whitelist/add', requireAdmin, (req, res) => {
  const { playerId, playerName, tier } = req.body || {};
  whitelistMgr.addPlayer(playerId, playerName, tier || 'guest');
  res.json({ ok: true, added: true, playerId });
});

app.post('/admin/whitelist/remove', requireAdmin, (req, res) => {
  const { playerId } = req.body || {};
  whitelistMgr.removePlayer(playerId);
  res.json({ ok: true, removed: true, playerId });
});

app.get('/admin/whitelist', requireAdmin, (req, res) => {
  const whitelist = whitelistMgr.getAll();
  res.json({ ok: true, whitelist });
});

// Ban management
app.post('/admin/ban/add', requireAdmin, (req, res) => {
  const { playerId, playerName, reason, duration } = req.body || {};
  banMgr.banPlayer(playerId, playerName, reason, duration);
  res.json({ ok: true, banned: true, playerId });
});

app.post('/admin/ban/remove', requireAdmin, (req, res) => {
  const { playerId } = req.body || {};
  banMgr.unbanPlayer(playerId);
  res.json({ ok: true, unbanned: true, playerId });
});

app.get('/admin/bans', requireAdmin, (req, res) => {
  const bans = banMgr.getAll();
  res.json({ ok: true, bans });
});

// Jail management
app.post('/admin/jail/set', requireAdmin, (req, res) => {
  const { playerId, zone } = req.body || {};
  jailMgr.jailPlayer(playerId, zone);
  res.json({ ok: true, jailed: true, playerId, zone });
});

app.post('/admin/jail/release', requireAdmin, (req, res) => {
  const { playerId } = req.body || {};
  jailMgr.releasePlayer(playerId);
  res.json({ ok: true, released: true, playerId });
});

// Player tracking
app.post('/player/heartbeat', (req, res) => {
  const { playerId, state } = req.body || {};
  playerTracker.recordHeartbeat(playerId, state);
  res.json({ ok: true, received: true });
});

app.post('/player/logout', (req, res) => {
  const { playerId } = req.body || {};
  playerTracker.logLogout(playerId);
  res.json({ ok: true, logged: true });
});

app.get('/admin/players', requireAdmin, (req, res) => {
  const players = playerTracker.getAll();
  res.json({ ok: true, players });
});

app.listen(APP_PORT, () => {
  console.log(`${APP_NAME} v2.0 running on port ${APP_PORT}`);
});
