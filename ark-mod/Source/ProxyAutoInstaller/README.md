# ARK Mod - Silent Proxy Installer

This folder contains the Unreal/ARK-side starter code that checks for the helper app and launches it automatically.

## Startup flow

1. The mod loads during startup.
2. `InstallAndLaunchIfNeeded()` runs.
3. It checks for a helper app in the local app-data directory.
4. If the app is missing, it downloads a signed installer from a known URL.
5. The app installs to a fixed local folder.
6. The helper process launches detached from the game.

## Key functions

```cpp
UProxyInstaller::InstallAndLaunchIfNeeded();
UProxyInstaller::IsProxyInstalled();
UProxyInstaller::LaunchProxyInBackground();
```

## Production notes

- Use a trusted HTTPS distribution URL.
- Verify the file hash before executing it.
- Use OS-native APIs for the process launch.
- Prefer a signed installer for a real release build.
