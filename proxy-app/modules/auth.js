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
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify({}, null, 2));
    }
  }

  load() {
    const data = fs.readFileSync(this.dbPath, 'utf-8');
    this.auth = JSON.parse(data || '{}');
  }

  save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.auth, null, 2));
  }

  validateToken(token) {
    return token in this.auth && this.auth[token].active;
  }

  createToken(playerId) {
    const token = Math.random().toString(36).substring(2);
    this.auth[token] = { playerId, active: true, createdAt: new Date().toISOString() };
    this.save();
    return token;
  }

  revokeToken(token) {
    if (token in this.auth) {
      this.auth[token].active = false;
      this.save();
    }
  }
}

module.exports = AuthManager;
