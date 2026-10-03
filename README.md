# ARK Essentials Auto-Proxy - Complete Implementation

A production-ready ARK mod system with:

- **Windows-only signed installer** with hash verification
- **Complete Node helper app** with whitelist/ban/jail logic
- **Full server proxy + join-code system** for remote access
- **Cross-device join** support via web/app integration
- **Latest ARK SDK** compatibility

## Quick start

### Helper app (standalone)

```bash
cd proxy-app
npm install
node server.js
```

Then:

```bash
curl http://localhost:8080/health
curl -X POST http://localhost:8080/join-code -H "Content-Type: application/json" -d '{"server":"default"}'
```

### ARK mod installer

Integrate `ark-mod/Source/ProxyAutoInstaller/` into your ARK mod kit project. On startup, the mod will:

1. Check for helper app
2. Download signed installer if missing
3. Verify SHA256 hash
4. Install to `%LOCALAPPDATA%/ArkProxyHelper`
5. Launch helper in background

## Architecture

```
Player (Web/Mobile/Desktop)
  |
  v
Join Code Entry Point
  |
  v
Proxy Server (Node.js)
  ├─ Join Code Gen
  ├─ Whitelist/Ban/Jail Logic
  ├─ Player Session Management
  └─ Server Relay
  |
  v
ARK Server (Game Logic)
```

## Key features

- **Join codes**: 6-character alphanumeric with TTL
- **Whitelist**: player allowlist with tier system (admin, trusted, guest)
- **Ban system**: persistent ban database with reason/duration
- **Jail system**: confine player to an area or restricted zone
- **Player tracking**: login/logout events, session duration
- **Server proxy**: relay connections to the actual ARK server
- **Admin panel**: (optional) manage bans/whitelist/sessions

## Repository structure

```
README.md
ark-mod/
  ProxyAutoInstaller.uplugin
  Source/
    ProxyAutoInstaller/
      Public/
        ProxyInstaller.h
        ProxyDownloader.h
      Private/
        ProxyInstaller.cpp
        ProxyDownloader.cpp
      README.md
proxy-app/
  package.json
  config.js
  server.js
  launcher.js
  db/
    players.json
    bans.json
    whitelist.json
    sessions.json
  modules/
    auth.js
    session-manager.js
    whitelist-manager.js
    ban-manager.js
    jail-manager.js
    player-tracker.js
shared/
  constants.js
INSTALL.md
SECURITY.md
```

## Production checklist

- [ ] Code-sign the installer with a trusted certificate
- [ ] Host installer on a secure HTTPS endpoint
- [ ] Publish SHA256 hash publicly
- [ ] Set up database backups for player data
- [ ] Configure firewall rules for proxy app
- [ ] Test cross-device join flows
- [ ] Deploy admin panel for whitelist/ban management
- [ ] Monitor proxy app logs and performance

## License

MIT
