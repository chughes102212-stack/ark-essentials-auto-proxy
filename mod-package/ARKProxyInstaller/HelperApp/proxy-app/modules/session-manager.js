const fs = require('fs');
const path = require('path');
const { DATABASE_DIR } = require('../config');

class SessionManager {
  constructor() {
    this.dbPath = path.join(DATABASE_DIR, 'sessions.json');
    this.ensure();
    this.load();
  }

  ensure() {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
    if (!fs.existsSync(this.dbPath)) fs.writeFileSync(this.dbPath, JSON.stringify({}, null, 2));
  }

  load() {
    const data = fs.readFileSync(this.dbPath, 'utf-8');
    this.sessions = JSON.parse(data || '{}');
  }

  save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.sessions, null, 2));
  }

  generateJoinCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
  }

  createSession(code, server) {
    const id = Math.random().toString(36).substring(2, 10);
    this.sessions[code] = {
      id,
      code,
      server,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
    this.save();
    return id;
  }

  validateJoinCode(code) {
    const session = this.sessions[code];
    if (!session) return null;
    if (new Date(session.expiresAt) < new Date()) {
      delete this.sessions[code];
      this.save();
      return null;
    }
    return session;
  }

  getAll() {
    return Object.values(this.sessions);
  }
}

module.exports = SessionManager;
