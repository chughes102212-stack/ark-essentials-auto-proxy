#pragma once

#include "CoreMinimal.h"

UCLASS()
class UProxyDownloader : public UObject
{
    GENERATED_BODY()

public:
    static bool DownloadFileWithVerification(const FString& URL, const FString& FilePath, const FString& ExpectedSHA256);
    static FString ComputeSHA256(const FString& FilePath);
};
