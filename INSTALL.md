# Installation and Setup Guide

## System Requirements

- Windows 10 or later (mod + proxy)
- ARK: Survival Evolved (latest version)
- Node.js 18+ (for proxy app)
- 2GB free disk space

## Step 1: Prepare the ARK Mod

1. Download the latest ARK Mod Development Kit.
2. Copy `ark-mod/ProxyAutoInstaller.uplugin` to your mod directory.
3. Copy `ark-mod/Source/ProxyAutoInstaller/` to your project source.
4. Build the mod in the ARK editor.
5. Test locally first.

## Step 2: Set up the Proxy App

```bash
cd proxy-app
npm install
```

Create a `.env` file:

```bash
PORT=8080
APP_NAME=ArkProxyHelper
JOIN_CODE_TTL=900
APP_INSTALL_DIR=C:/Users/Default/AppData/Local/ArkProxyHelper
DOWNLOAD_URL=https://your-domain.com/ark-proxy-installer-v1.0.exe
INSTALLER_SHA256=abc123def456...
ADMIN_PASSWORD=changeme
```

## Step 3: Create a Signed Installer

1. Use a tool like NSIS or Inno Setup to create a Windows installer.
2. Include the proxy app files (Node.js + express + modules).
3. Sign the installer with your code-signing certificate.
4. Host on your release server.
5. Compute and publish the SHA256 hash.

## Step 4: Update Mod Config

In `ark-mod/Source/ProxyAutoInstaller/Private/ProxyInstaller.cpp`, update:

```cpp
const FString DownloadURL = TEXT("https://your-domain.com/ark-proxy-installer-v1.0.exe");
const FString ExpectedSHA256 = TEXT("abc123def456...");
```

## Step 5: Launch and Test

1. Start the ARK server.
2. Launch ARK client with the mod installed.
3. Watch the game log for installer status.
4. Verify proxy app starts in the background.
5. Test join code generation via `curl http://localhost:8080/join-code`.

## Step 6: Deploy

1. Publish mod to Steam Workshop or your hosting.
2. Share join codes with players.
3. Monitor proxy app logs.
4. Scale proxy app as needed.

## Troubleshooting

- **Mod won't install**: Check Windows UAC permissions.
- **Proxy app crashes**: Review `%LOCALAPPDATA%/ArkProxyHelper/logs/`.
- **Join code not working**: Verify `config.js` port and firewall rules.
- **Players can't join**: Check ARK server logs for player rejection.

## Support

For issues, check:
- Proxy app logs
- ARK server log
- Windows event viewer
- Mod debugging output
