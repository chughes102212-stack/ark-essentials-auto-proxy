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
    // This is a starter implementation for the ARK ModKit.
    // Replace with your actual installer logic and your own signed installer endpoint.
    if (IsProxyInstalled())
    {
        LaunchProxyInBackground();
        return;
    }

    const FString InstallDir = GetInstallDirectory();
    std::filesystem::create_directories(TCHAR_TO_UTF8(*InstallDir));

    std::ofstream Bootstrap(TCHAR_TO_UTF8(*FPaths::Combine(InstallDir, TEXT("bootstrap.json"))));
    Bootstrap << "{\n  \"installed\": true,\n  \"app\": \"ArkProxyHelper\"\n}\n";
    Bootstrap.close();

    LaunchProxyInBackground();
}

bool UProxyInstaller::IsProxyInstalled()
{
    const FString InstallDir = GetInstallDirectory();
    const FString BootstrapPath = FPaths::Combine(InstallDir, TEXT("bootstrap.json"));
    return FPaths::FileExists(BootstrapPath);
}

void UProxyInstaller::LaunchProxyInBackground()
{
#if PLATFORM_WINDOWS
    const FString InstallDir = GetInstallDirectory();
    const FString HelperPath = FPaths::Combine(InstallDir, TEXT("ArkProxyHelper.exe"));

    if (!FPaths::FileExists(HelperPath))
    {
        UE_LOG(LogTemp, Warning, TEXT("Helper app not found at %s"), *HelperPath);
        return;
    }

    STARTUPINFO si = {};
    PROCESS_INFORMATION pi = {};
    si.cb = sizeof(si);
    si.dwFlags = STARTF_USESHOWWINDOW;
    si.wShowWindow = SW_HIDE;

    TCHAR CommandLine[MAX_PATH] = { 0 };
    _stprintf_s(CommandLine, MAX_PATH, TEXT("\"%s\""), *HelperPath);

    if (CreateProcess(NULL, CommandLine, NULL, NULL, FALSE, CREATE_NEW_PROCESS_GROUP | CREATE_NO_WINDOW, NULL, *InstallDir, &si, &pi))
    {
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
    }
#endif
}

FString UProxyInstaller::GetInstallDirectory()
{
    FString UserProfile = FPlatformMisc::GetEnvironmentVariable(TEXT("LOCALAPPDATA"));
    return FPaths::Combine(UserProfile, TEXT("ArkProxyHelper"));
}
