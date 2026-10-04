const fs = require('fs');
const path = require('path');
const { DATABASE_DIR } = require('../config');

class PlayerTracker {
  constructor() {
    this.dbPath = path.join(DATABASE_DIR, 'players.json');
    this.ensure();
    this.load();
  }

  ensure() {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
    if (!fs.existsSync(this.dbPath)) fs.writeFileSync(this.dbPath, JSON.stringify({}, null, 2));
  }

  load() {
    this.players = JSON.parse(fs.readFileSync(this.dbPath, 'utf-8') || '{}');
  }

  save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.players, null, 2));
  }

  logLogin(playerId, playerName, server) {
    this.players[playerId] = {
      playerId,
      playerName,
      server,
      status: 'online',
      lastLogin: new Date().toISOString(),
      loginCount: (this.players[playerId]?.loginCount || 0) + 1
    };
    this.save();
  }

  logLogout(playerId) {
    if (this.players[playerId]) {
      this.players[playerId].status = 'offline';
      this.players[playerId].lastLogout = new Date().toISOString();
      this.save();
    }
  }

  recordHeartbeat(playerId, state) {
    if (this.players[playerId]) {
      this.players[playerId].status = state || 'online';
      this.players[playerId].lastHeartbeat = new Date().toISOString();
      this.save();
    }
  }

  getAll() {
    return Object.values(this.players);
  }

  getOnlinePlayers() {
    return Object.values(this.players).filter(p => p.status === 'online');
  }
}

module.exports = PlayerTracker;
