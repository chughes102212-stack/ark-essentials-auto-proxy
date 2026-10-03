# Proxy App

This companion app is meant to run in the background and act as a lightweight local server proxy and join-code manager.

## Purpose

- generate unique join codes
- expose an API for the ARK mod
- track connected users
- build routing logic to a hosted or local ARK server
- act as an “Essentials-like” management layer

## Quick start

```bash
npm install
node server.js
```

## Environment

```bash
PORT=8080
APP_NAME=ArkProxyHelper
JOIN_CODE_TTL=900
```

## API endpoints

- `GET /health` — app health
- `POST /join-code` — generate a new join code
- `POST /session/start` — start a server session
- `POST /session/end` — end a session
- `POST /player/heartbeat` — heartbeat from game/mod

## Notes

This is a starter implementation only. Production use should include:

- secure auth
- signed download verification
- a persistent database
- real routing/proxy logic for the actual ARK server

## File list

- `package.json` — Node dependencies
- `config.js` — runtime configuration
- `server.js` — API server and join code logic
- `install-helper.js` — optional installer bootstrap logic
