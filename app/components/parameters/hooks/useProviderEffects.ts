import { useEffect } from "react";

import type { Provider } from "../types";

export const useProviderEffects = (
  selectedProviderId: string,
  selectedModelId: string | null,
  setSelectedModelId: (modelId: string | null) => void,
  responseFormat: "url" | "b64_json" | "base64",
  setResponseFormat: React.Dispatch<React.SetStateAction<"url" | "b64_json" | "base64">>,
  setStepsInputValue: React.Dispatch<React.SetStateAction<string>>,
  setOutputType: React.Dispatch<React.SetStateAction<"URL" | "base64Data" | "dataURI">>,
  providers: Provider[]
) => {
  useEffect(() => {
    const provider = providers.find((p) => p.id === selectedProviderId);
    if (!provider) return;

    const firstModelId = provider.models[0]?.id || null;
    const currentModelIsValid = provider.models.some((m) => m.id === selectedModelId);

    if (!currentModelIsValid) {
      setSelectedModelId(firstModelId);
    }

    if (selectedProviderId === "pollinations") {
      // Pollinations doesn't use responseFormat in its request, no change needed
    } else if (selectedProviderId === "together") {
      setStepsInputValue("4");
      if (responseFormat !== "url" && responseFormat !== "base64") {
        setResponseFormat("url");
      }
    } else if (selectedProviderId === "xai") {
      if (responseFormat !== "url" && responseFormat !== "b64_json") {
        setResponseFormat("url");
      }
    } else if (selectedProviderId === "runware") {
      setStepsInputValue("40");
      setOutputType("URL");
    }
  }, [
    selectedProviderId,
    selectedModelId,
    responseFormat,
    setSelectedModelId,
    setResponseFormat,
    setStepsInputValue,
    setOutputType,
    providers,
  ]);
};
