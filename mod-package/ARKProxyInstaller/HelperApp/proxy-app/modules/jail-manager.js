const fs = require('fs');
const path = require('path');
const { DATABASE_DIR } = require('../config');

class JailManager {
  constructor() {
    this.dbPath = path.join(DATABASE_DIR, 'jail.json');
    this.ensure();
    this.load();
  }

  ensure() {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
    if (!fs.existsSync(this.dbPath)) fs.writeFileSync(this.dbPath, JSON.stringify({}, null, 2));
  }

  load() {
    this.jails = JSON.parse(fs.readFileSync(this.dbPath, 'utf-8') || '{}');
  }

  save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.jails, null, 2));
  }

  jailPlayer(playerId, zone) {
    this.jails[playerId] = { playerId, zone, jailedAt: new Date().toISOString() };
    this.save();
  }

  releasePlayer(playerId) {
    delete this.jails[playerId];
    this.save();
  }

  getJailZone(playerId) {
    return this.jails[playerId]?.zone || null;
  }

  getAll() {
    return Object.values(this.jails);
  }
}

module.exports = JailManager;
