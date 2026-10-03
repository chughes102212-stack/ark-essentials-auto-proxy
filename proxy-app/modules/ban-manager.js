const fs = require('fs');
const path = require('path');
const { DATABASE_DIR } = require('../config');

class BanManager {
  constructor() {
    this.dbPath = path.join(DATABASE_DIR, 'bans.json');
    this.ensure();
    this.load();
    this.cleanupExpiredBans();
  }

  ensure() {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify({}, null, 2));
    }
  }

  load() {
    const data = fs.readFileSync(this.dbPath, 'utf-8');
    this.bans = JSON.parse(data || '{}');
  }

  save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.bans, null, 2));
  }

  banPlayer(playerId, playerName, reason, durationSeconds = null) {
    const expiresAt = durationSeconds ? new Date(Date.now() + durationSeconds * 1000).toISOString() : null;

    this.bans[playerId] = {
      playerId,
      playerName,
      reason,
      bannedAt: new Date().toISOString(),
      expiresAt // null = permanent
    };
    this.save();
  }

  unbanPlayer(playerId) {
    delete this.bans[playerId];
    this.save();
  }

  isBanned(playerId) {
    if (!(playerId in this.bans)) return false;

    const ban = this.bans[playerId];
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

  cleanupExpiredBans() {
    let dirty = false;
    for (const [playerId, ban] of Object.entries(this.bans)) {
      if (ban.expiresAt && new Date(ban.expiresAt) < new Date()) {
        delete this.bans[playerId];
        dirty = true;
      }
    }
    if (dirty) this.save();
  }
}

module.exports = BanManager;
