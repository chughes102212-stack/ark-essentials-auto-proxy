#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ProxyInstaller.generated.h"

UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class UProxyInstaller : public UActorComponent
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintCallable, Category = "ARK|Proxy")
    static void InstallAndLaunchIfNeeded();

    UFUNCTION(BlueprintCallable, Category = "ARK|Proxy")
    static bool IsProxyInstalled();

    UFUNCTION(BlueprintCallable, Category = "ARK|Proxy")
    static void LaunchProxyInBackground();

    UFUNCTION(BlueprintCallable, Category = "ARK|Proxy")
    static FString GetInstallDirectory();

    UFUNCTION(BlueprintCallable, Category = "ARK|Proxy")
    static void DownloadInstaller(const FString& URL, const FString& SHA256);
};
