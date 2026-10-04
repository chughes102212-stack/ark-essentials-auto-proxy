# ARK Proxy Mod Package

This directory is structured as a ZIP-ready mod package for the ARK ModKit.

## Intended layout

When you zip this folder and extract it into your ARK mod directory, the folder structure should look like:

```text
ARKProxyInstaller/
  ARKProxyInstaller.uplugin
  Source/
    ARKProxyInstaller/
      Public/
        ProxyInstaller.h
      Private/
        ProxyInstaller.cpp
  HelperApp/
    README.txt
    start-helper.bat
    proxy-app/
      package.json
      config.js
      server.js
      launcher.js
      public/
        index.html
        admin.html
      modules/
        session-manager.js
        whitelist-manager.js
        ban-manager.js
        jail-manager.js
        player-tracker.js
        auth.js
  Binaries/
    Win64/
      README.txt
```

## Important notes

- This is a mod package scaffold, not a precompiled binary.
- The actual ARK mod still requires the official ARK ModKit and the correct game version to compile.
- The helper app is included as a local testing app and can be launched with `start-helper.bat`.
- You can zip this folder and extract into your ARK mod folder for local testing before final compilation.
