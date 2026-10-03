# ARK Mod - Silent Proxy Installer

This folder contains the ARK-side code skeleton for a mod that silently checks for, downloads, and launches a companion proxy app.

## Files

- `ProxyAutoInstaller.uplugin` — plugin definition
- `Source/ProxyAutoInstaller/Public/ProxyInstaller.h` — public interface
- `Source/ProxyAutoInstaller/Private/ProxyInstaller.cpp` — installer logic

## Expected behavior

On game startup, the mod should:

1. Check whether the companion proxy app is installed locally.
2. If missing, download the installer from a trusted URL.
3. Verify checksum/signature if available.
4. Install the app to a standard location.
5. Launch it in the background.
6. Keep a small status message in the game log.

## Example flow

```cpp
UProxyInstaller::InstallAndLaunchIfNeeded();
```

This should eventually:

- check `%LOCALAPPDATA%/ArkProxyHelper/`
- download the proxy binary or installer
- write a config file
- start the process detached from the game process
- send a health ping or callback to the server app

## Important notes

ARK mod code is highly version-specific. Use the exact SDK version and class structure for the target ARK build.

This code is only a starter scaffold and should be adapted to the official ARK plugin API used by your mod kit.
