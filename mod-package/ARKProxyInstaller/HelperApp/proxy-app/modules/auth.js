const fs = require('fs');
const path = require('path');
const { DATABASE_DIR } = require('../config');

class AuthManager {
  constructor() {
    this.dbPath = path.join(DATABASE_DIR, 'auth.json');
    this.ensure();
    this.load();
  }

  ensure() {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
    if (!fs.existsSync(this.dbPath)) fs.writeFileSync(this.dbPath, JSON.stringify({}, null, 2));
  }

  load() {
    this.auth = JSON.parse(fs.readFileSync(this.dbPath, 'utf-8') || '{}');
  }

  save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.auth, null, 2));
  }

  createToken(playerId) {
    const token = Math.random().toString(36).slice(2, 10);
    this.auth[token] = { playerId, active: true, createdAt: new Date().toISOString() };
    this.save();
    return token;
  }

  validateToken(token) {
    return !!this.auth[token]?.active;
  }
}

module.exports = AuthManager;
