const fs = require('fs');
const path = require('path');
const { DATABASE_DIR } = require('../config');

class WhitelistManager {
  constructor() {
    this.dbPath = path.join(DATABASE_DIR, 'whitelist.json');
    this.ensure();
    this.load();
  }

  ensure() {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify({}, null, 2));
    }
  }

  load() {
    const data = fs.readFileSync(this.dbPath, 'utf-8');
    this.whitelist = JSON.parse(data || '{}');
  }

  save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.whitelist, null, 2));
  }

  addPlayer(playerId, playerName, tier = 'guest') {
    this.whitelist[playerId] = {
      playerId,
      playerName,
      tier, // 'admin', 'trusted', 'guest'
      addedAt: new Date().toISOString()
    };
    this.save();
  }

  removePlayer(playerId) {
    delete this.whitelist[playerId];
    this.save();
  }

  isWhitelisted(playerId) {
    return playerId in this.whitelist;
  }

  getPlayer(playerId) {
    return this.whitelist[playerId];
  }

  getAll() {
    return Object.values(this.whitelist);
  }
}

module.exports = WhitelistManager;
