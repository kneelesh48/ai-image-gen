import type { ApiRequestBody, ILora } from "../types";

export interface FormValidationParams {
  selectedProviderId: string;
  selectedModelId: string | null;
  prompt: string;
  n: number;
  responseFormat: "url" | "b64_json" | "base64";
  seedInputValue: string;
  widthInputValue: string;
  heightInputValue: string;
  stepsInputValue: string;
  cfgScaleInputValue: string;
  negativePrompt: string;
  outputType: "URL" | "base64Data" | "dataURI";
  loras: ILora[];
  nologo: boolean;
  privateImage: boolean;
  enhance: boolean;
}

export const validateAndBuildRequestBody = (params: FormValidationParams): ApiRequestBody => {
  const {
    selectedProviderId,
    selectedModelId,
    prompt,
    n,
    responseFormat,
    seedInputValue,
    widthInputValue,
    heightInputValue,
    stepsInputValue,
    cfgScaleInputValue,
    negativePrompt,
    outputType,
    loras,
    nologo,
    privateImage,
    enhance,
  } = params;

  if (!selectedModelId || !prompt) {
    throw new Error(
      !selectedModelId ? "Please select a model." : "Please enter a prompt."
    );
  }

  if (selectedProviderId === "xai") {
    if (n < 1 || n > 10) {
      throw new Error("Number of images (n) must be between 1 and 10 for xAI.");
    }
    return {
      prompt,
      model: selectedModelId,
      n: n,
      response_format: responseFormat as "url" | "b64_json",
    };
  }

  if (selectedProviderId === "pollinations") {
    const parsedSeed = parseInt(seedInputValue, 10);
    const parsedWidth = parseInt(widthInputValue, 10);
    const parsedHeight = parseInt(heightInputValue, 10);
    if (isNaN(parsedSeed))
      throw new Error("Seed must be a valid integer for Pollinations.");
    if (isNaN(parsedWidth) || parsedWidth <= 0)
      throw new Error("Width must be a positive number for Pollinations.");
    if (isNaN(parsedHeight) || parsedHeight <= 0)
      throw new Error("Height must be a positive number for Pollinations.");
    return {
      prompt,
      model: selectedModelId,
      seed: parsedSeed,
      width: parsedWidth,
      height: parsedHeight,
      nologo,
      private: privateImage,
      enhance,
    };
  }

  if (selectedProviderId === "together") {
    const parsedWidth = parseInt(widthInputValue, 10);
    const parsedHeight = parseInt(heightInputValue, 10);
    const parsedSteps = parseInt(stepsInputValue, 10);
    if (n < 1 || n > 4)
      throw new Error("Number of images (n) must be between 1 and 4 for Together.");
    if (isNaN(parsedWidth) || parsedWidth <= 0)
      throw new Error("Width must be a positive number for Together.");
    if (isNaN(parsedHeight) || parsedHeight <= 0)
      throw new Error("Height must be a positive number for Together.");
    if (isNaN(parsedSteps) || parsedSteps <= 0)
      throw new Error("Steps must be a positive number for Together.");
    return {
      prompt,
      model: selectedModelId,
      width: parsedWidth,
      height: parsedHeight,
      steps: parsedSteps,
      n: n,
      response_format: responseFormat as "url" | "base64",
    };
  }

  if (selectedProviderId === "runware") {
    const parsedWidth = parseInt(widthInputValue, 10);
    const parsedHeight = parseInt(heightInputValue, 10);
    const parsedSteps = parseInt(stepsInputValue, 10);
    const parsedCfgScale = parseFloat(cfgScaleInputValue);
    const parsedSeed = seedInputValue
      ? parseInt(seedInputValue, 10)
      : undefined;

    if (n < 1 || n > 10)
      throw new Error(
        "Number of images (n) must be between 1 and 10 for Runware."
      );
    if (isNaN(parsedWidth) || parsedWidth <= 0)
      throw new Error("Width must be a positive number for Runware.");
    if (isNaN(parsedHeight) || parsedHeight <= 0)
      throw new Error("Height must be a positive number for Runware.");
    if (isNaN(parsedSteps) || parsedSteps <= 0)
      throw new Error("Steps must be a positive number for Runware.");
    if (isNaN(parsedCfgScale) || parsedCfgScale <= 0)
      throw new Error("CFG Scale must be a positive number for Runware.");
    if (seedInputValue && isNaN(parsedSeed!))
      throw new Error("Seed must be a valid integer for Runware.");

    return {
      prompt,
      model: selectedModelId,
      width: parsedWidth,
      height: parsedHeight,
      steps: parsedSteps,
      CFGScale: parsedCfgScale,
      numberResults: n,
      outputType,
      ...(negativePrompt && { negativePrompt }),
      ...(parsedSeed && { seed: parsedSeed }),
      ...(loras.length > 0 && { lora: loras }),
    };
  }

  if (selectedProviderId === "google") {
    return {
      prompt: `Generate ${n} images of\n\n${prompt}`,
      model: selectedModelId,
    };
  }

  throw new Error(`Unsupported provider selected: ${selectedProviderId}`);
};
