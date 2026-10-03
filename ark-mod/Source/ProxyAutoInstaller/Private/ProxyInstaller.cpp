#include "ProxyInstaller.h"
#include "ProxyDownloader.h"

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
        UE_LOG(LogTemp, Warning, TEXT("Proxy app already installed. Launching..."));
        LaunchProxyInBackground();
        return;
    }

    UE_LOG(LogTemp, Warning, TEXT("Proxy app not found. Downloading and installing..."));

    const FString URL = TEXT("https://example.com/ark-proxy-installer-v2.0.exe");
    const FString SHA256 = TEXT("abc123def456789"); // Replace with actual hash
    const FString InstallerDir = GetInstallDirectory();
    const FString InstallerPath = FPaths::Combine(InstallerDir, TEXT("installer.exe"));

    // Create install directory
    std::filesystem::create_directories(TCHAR_TO_UTF8(*InstallerDir));

    // Download with verification
    if (!UProxyDownloader::DownloadFileWithVerification(URL, InstallerPath, SHA256))
    {
        UE_LOG(LogTemp, Error, TEXT("Failed to download or verify installer"));
        return;
    }

    // Write bootstrap
    const FString BootstrapPath = FPaths::Combine(InstallerDir, TEXT("bootstrap.json"));
    std::ofstream BootstrapFile(TCHAR_TO_UTF8(*BootstrapPath));
    BootstrapFile << "{\n  \"installed\": false,\n  \"app\": \"ArkProxyHelper\",\n  \"version\": \"2.0.0\"\n}\n";
    BootstrapFile.close();

    // Execute installer
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
        UE_LOG(LogTemp, Warning, TEXT("Helper exe not found at: %s"), *HelperPath);
        return;
    }

    STARTUPINFO si = {};
    PROCESS_INFORMATION pi = {};
    si.cb = sizeof(si);
    si.dwFlags = STARTF_USESHOWWINDOW;
    si.wShowWindow = SW_HIDE;

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
        UE_LOG(LogTemp, Warning, TEXT("Proxy app launched with PID: %d"), pi.dwProcessId);
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
    }
    else
    {
        UE_LOG(LogTemp, Error, TEXT("Failed to launch proxy app"));
    }
#endif
}

FString UProxyInstaller::GetInstallDirectory()
{
    FString UserProfile = FPlatformMisc::GetEnvironmentVariable(TEXT("LOCALAPPDATA"));
    return FPaths::Combine(UserProfile, TEXT("ArkProxyHelper"));
}

void UProxyInstaller::DownloadInstaller(const FString& URL, const FString& SHA256)
{
    const FString InstallerDir = GetInstallDirectory();
    const FString InstallerPath = FPaths::Combine(InstallerDir, TEXT("installer.exe"));

    UProxyDownloader::DownloadFileWithVerification(URL, InstallerPath, SHA256);
}
