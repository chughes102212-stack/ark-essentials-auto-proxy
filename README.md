# ARK Essentials Auto-Proxy

This repository contains a starter implementation for an ARK mod that silently installs and launches a background helper app when the game starts.

## What it does

- checks whether a companion proxy app is installed
- downloads a signed installer if it is missing
- installs the app under the user's local app-data folder
- launches the helper app in the background without prompting
- exposes a lightweight join-code API from the helper app

## Architecture

```text
ARK Game
  │
  └── ARK Mod
        ├── checks for proxy helper
        ├── downloads installer if missing
        ├── installs to %LOCALAPPDATA%
        ├── launches helper app detached
        └── reports player/session events

Helper App (Node.js)
  ├── /health
  ├── /join-code
  ├── /session/start
  ├── /session/end
  └── /player/heartbeat
```

## Recommended production safety

For real-world use, make the installer:

- signed with a trusted certificate
- downloaded only from your own release host
- verified with a SHA256 hash before execution
- installed into a dedicated app-local folder
- launched with a detached process that is not tied to the game window

## Repository layout

```text
README.md
ark-mod/
  ProxyAutoInstaller.uplugin
  Source/
    ProxyAutoInstaller/
      Public/
        ProxyInstaller.h
      Private/
        ProxyInstaller.cpp
      README.md
proxy-app/
  package.json
  config.js
  server.js
  install-helper.js
  launcher.js
shared/
  constants.js
```

## Install and run the helper app locally

```bash
cd proxy-app
npm install
node server.js
```

Then open:

- http://localhost:8080/health

## Notes

This is a starter scaffold, not a production-ready ARK server mod. Actual production deployment should also include:

- app signing and verification
- OS-specific install logic
- robust logging
- whitelist/ban database
- real network proxy behavior for the actual ARK server

## License

For learning and prototype work.
