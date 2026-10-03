#include "ProxyInstaller.h"

#if PLATFORM_WINDOWS
#include "Windows/AllowWindowsPlatformTypes.h"
#include <windows.h>
#include "Windows/HideWindowsPlatformTypes.h"
#endif

#include <filesystem>
#include <fstream>

void UProxyInstaller::InstallAndLaunchIfNeeded()
{
    if (IsProxyInstalled())
    {
        LaunchProxyInBackground();
        return;
    }

    // Production flow:
    // 1. Download installer from signed endpoint
    // 2. Validate SHA256 or digital signature
    // 3. Install under %LOCALAPPDATA%/ArkProxyHelper
    // 4. Launch helper with detached process

    const FString InstallDir = GetInstallDirectory();
    std::filesystem::create_directories(TCHAR_TO_UTF8(*InstallDir));

    // Write a local bootstrap file as a placeholder for a real installer.
    std::ofstream BootstrapFile(TCHAR_TO_UTF8(*InstallDir) + std::string("/bootstrap.json"));
    BootstrapFile << "{\n  \"installed\": true,\n  \"app\": \"ArkProxyHelper\"\n}\n";
    BootstrapFile.close();

    LaunchProxyInBackground();
}

bool UProxyInstaller::IsProxyInstalled()
{
    const FString InstallDir = GetInstallDirectory();
    const FString BootstrapPath = InstallDir + "/bootstrap.json";

    return FPaths::FileExists(BootstrapPath);
}

void UProxyInstaller::LaunchProxyInBackground()
{
#if PLATFORM_WINDOWS
    const FString InstallDir = GetInstallDirectory();
    const FString HelperPath = InstallDir + "/ArkProxyHelper.exe";

    // Example of a detached background launch.
    // Replace with the actual helper app executable name and install path.
    STARTUPINFO si = {};
    PROCESS_INFORMATION pi = {};

    TCHAR CommandLine[MAX_PATH] = { 0 };
    _stprintf_s(CommandLine, MAX_PATH, TEXT("\"%s\""), *HelperPath);

    if (CreateProcess(
        NULL,
        CommandLine,
        NULL,
        NULL,
        FALSE,
        CREATE_NEW_PROCESS_GROUP | CREATE_NO_WINDOW,
        NULL,
        *InstallDir,
        &si,
        &pi))
    {
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
    }
#endif
}

FString UProxyInstaller::GetInstallDirectory()
{
    FString UserProfile = FPaths::Combine(FPlatformProcess::UserDir(), "AppData", "Local");
    return FPaths::Combine(UserProfile, TEXT("ArkProxyHelper"));
}
