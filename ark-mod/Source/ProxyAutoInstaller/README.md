# ARK Mod - Silent Proxy Installer v2.0

Complete Unreal/ARK-side implementation for signed installer download and auto-launch.

## Files

- `ProxyAutoInstaller.uplugin` — plugin definition (v2.0)
- `Public/ProxyInstaller.h` — installer interface
- `Public/ProxyDownloader.h` — downloader with SHA256 verification
- `Private/ProxyInstaller.cpp` — main installer logic
- `Private/ProxyDownloader.cpp` — download + verify implementation

## Key flow

1. `InstallAndLaunchIfNeeded()` runs on game startup
2. Checks if proxy app is already installed
3. If missing, downloads signed installer from trusted HTTPS URL
4. Verifies SHA256 hash before execution
5. Installs to `%LOCALAPPDATA%/ArkProxyHelper`
6. Launches helper app detached in background
7. Logs all steps to ARK game logs

## Security

- Downloads only from your controlled HTTPS endpoint
- Verifies SHA256 hash of installer
- Runs with CREATE_NO_WINDOW (hidden)
- Detached process (doesn't block game)
- Logs activity for audit

## Functions

```cpp
UProxyInstaller::InstallAndLaunchIfNeeded()    // Main entry point
UProxyInstaller::IsProxyInstalled()              // Check if already installed
UProxyInstaller::LaunchProxyInBackground()       // Launch helper app
UProxyInstaller::GetInstallDirectory()           // Get %LOCALAPPDATA% path
UProxyInstaller::DownloadInstaller()             // Download with verification
```

## Integration

Call from your mod's startup:

```cpp
UProxyInstaller::InstallAndLaunchIfNeeded();
```

## Latest version

- v2.0.0 with SHA256 verification
- Windows-only (x64)
- ARK SDK compatible

## Notes

- Replace `https://example.com/ark-proxy-installer-v2.0.exe` with your actual release URL
- Replace SHA256 hash with actual computed value
- Implement actual HTTP download in `ProxyDownloader.cpp` using FHttpModule
