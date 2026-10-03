# ARK Essentials Auto-Proxy

This repository contains a starter project for an ARK mod that silently installs and launches a local server proxy app in the background when the game starts.

## Overview

The project is split into two parts:

- `ark-mod/` — Unreal/ARK side that detects whether the proxy is installed and launches it automatically.
- `proxy-app/` — background desktop app that provides join-code routing, authentication, and a lightweight server proxy layer.
- `shared/` — common constants and API contracts used by both sides.

## Goal

When a player adds the mod and launches ARK, the mod checks whether the companion proxy app exists. If it does not, it downloads and launches it silently in the background. The proxy app then generates join codes, tracks player sessions, and proxies server access.

## Architecture

```text
ARK Game
  │
  └── ARK Mod
        ├── checks for proxy app
        ├── silently installs/downloads if missing
        ├── launches proxy app in background
        └── sends lifecycle events to proxy

Proxy App
  ├── generates join code
  ├── manages local server routing
  ├── tracks player connections
  └── exposes admin API for mod integration
```

## Important note

This repository is a starter implementation and not a complete production-grade ARK server proxy. Actual ARK mod development requires the official ARK Mod SDK / Unreal project setup and is version-specific.

The included code is intended to show the design pattern for:

- silent background install
- startup detection
- join code generation
- local proxy service
- communication between the game and the helper app

## Repo layout

```text
README.md
ark-mod/
  README.md
  Source/
    ProxyAutoInstaller/
      Public/
        ProxyInstaller.h
      Private/
        ProxyInstaller.cpp
  ProxyAutoInstaller.uplugin
proxy-app/
  README.md
  package.json
  server.js
  config.js
  install-helper.js
shared/
  constants.js
```

## Recommended next steps

1. Open the ARK mod files in the official ModKit / Unreal project.
2. Wire the launcher to your chosen download URL or GitHub release.
3. Add a secure file hash check before running the downloaded installer.
4. Extend the proxy app with real player auth and route management.
5. Add platform-specific installer logic for Windows/macOS/Linux.

## License

This project is provided as a starter scaffold for experimentation and learning.

## Disclaimer

Silent installation of an external executable should be treated carefully. For production use, use a signed installer, release verification, and explicit user consent where appropriate.
