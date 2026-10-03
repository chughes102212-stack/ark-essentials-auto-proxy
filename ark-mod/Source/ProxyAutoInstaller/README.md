# Unreal / ARK Mod Starter

This file is a placeholder for the ARK mod-side C++ implementation.

## Recommended class layout

```cpp
UCLASS()
class UProxyInstaller : public UActorComponent
{
    GENERATED_BODY()

public:
    static void InstallAndLaunchIfNeeded();
    static bool IsProxyInstalled();
    static void LaunchProxyInBackground();
};
```

## Typical flow

```cpp
void UProxyInstaller::InstallAndLaunchIfNeeded()
{
    if (IsProxyInstalled())
    {
        LaunchProxyInBackground();
        return;
    }

    // Download installer silently
    // Verify checksum
    // Install to AppData/Local or Program Files
    // Launch the app
}
```

## Notes

- Use `CreateProcess` / Windows shell APIs or equivalent OS-specific launch methods.
- Detect the correct install directory for the target OS.
- Prefer a secure signed installer if you plan to auto-download from the internet.
