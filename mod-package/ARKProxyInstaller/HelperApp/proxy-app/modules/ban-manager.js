const fs = require('fs');
const path = require('path');
const { DATABASE_DIR } = require('../config');

class BanManager {
  constructor() {
    this.dbPath = path.join(DATABASE_DIR, 'bans.json');
    this.ensure();
    this.load();
  }

  ensure() {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
    if (!fs.existsSync(this.dbPath)) fs.writeFileSync(this.dbPath, JSON.stringify({}, null, 2));
  }

  load() {
    this.bans = JSON.parse(fs.readFileSync(this.dbPath, 'utf-8') || '{}');
  }

  save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.bans, null, 2));
  }

  banPlayer(playerId, playerName, reason, duration = 0) {
    this.bans[playerId] = {
      playerId,
      playerName,
      reason,
      bannedAt: new Date().toISOString(),
      expiresAt: duration > 0 ? new Date(Date.now() + duration * 1000).toISOString() : null
    };
    this.save();
  }

  unbanPlayer(playerId) {
    delete this.bans[playerId];
    this.save();
  }

  isBanned(playerId) {
    const ban = this.bans[playerId];
    if (!ban) return false;
    if (ban.expiresAt && new Date(ban.expiresAt) < new Date()) {
      this.unbanPlayer(playerId);
      return false;
    }
    return true;
  }

  getBan(playerId) {
    return this.bans[playerId] || null;
  }

  getAll() {
    return Object.values(this.bans);
  }
}

module.exports = BanManager;
