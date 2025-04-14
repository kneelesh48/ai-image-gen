"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Settings, Loader2, Wand2 } from "lucide-react";

import type { ApiRequestBody } from './parameters/types';
import { providers } from './parameters/constants';

import { useParameterPersistence } from './parameters/hooks/useParameterPersistence';

import { ProviderModelSelector } from './parameters/ProviderModelSelector';
import { PromptInput } from './parameters/PromptInput';
import { NumberInput } from './parameters/NumberInput';
import { XaiOptions } from './parameters/XaiOptions';
import { TogetherOptions } from './parameters/TogetherOptions';
import { PollinationsOptions } from './parameters/PollinationsOptions';

interface ParametersFormProps {
  isLoading: boolean;
  onGenerate: (providerId: string, requestBody: ApiRequestBody) => void;
  n: number;
  setN: React.Dispatch<React.SetStateAction<number>>;
}

// --- Component ---
const ParametersForm: React.FC<ParametersFormProps> = ({isLoading, onGenerate, n, setN}) => {
  const [
    selectedProviderId, setSelectedProviderId,
    selectedModelId, setSelectedModelId
  ] = useParameterPersistence(providers);
  const [prompt, setPrompt] = useState<string>("A young woman in a field of flowers");

  const [responseFormat, setResponseFormat] = useState<"url" | "b64_json" | "base64">("url");

  // Together specific parameters
  const [widthInputValue, setWidthInputValue] = useState<string>("1024");
  const [heightInputValue, setHeightInputValue] = useState<string>("1024");
  const [stepsInputValue, setStepsInputValue] = useState<string>("4");

  // Pollinations specific toggles
  const [seedInputValue, setSeedInputValue] = useState<string>(() => String(Date.now()));
  const [nologo, setNologo] = useState<boolean>(true);
  const [privateImage, setPrivateImage] = useState<boolean>(true);
  const [enhance, setEnhance] = useState<boolean>(false);

  // Internal UI State
  const [formError, setFormError] = useState<string | null>(null);

  // Effect to ensure model validity and reset response format on provider change
  useEffect(() => {
    const provider = providers.find((p) => p.id === selectedProviderId);
    if (!provider) return; // Should not happen if hook initializes correctly

    const firstModelId = provider.models[0]?.id || null;
    const currentModelIsValid = provider.models.some(
      (m) => m.id === selectedModelId
    );

    if (!currentModelIsValid) {
      setSelectedModelId(firstModelId);
    }

    // Reset response format based on provider capabilities if needed
    // Ensure the current format is valid for the selected provider
    if (selectedProviderId === 'pollinations') {
        // Pollinations doesn't use responseFormat in its request, no change needed
    } else if (selectedProviderId === 'together') {
        // Together supports 'url' or 'base64'
        if (responseFormat !== 'url' && responseFormat !== 'base64') {
            setResponseFormat('url'); // Default to url if invalid
        }
    } else if (selectedProviderId === 'xai') {
        // xAI supports 'url' or 'b64_json'
        if (responseFormat !== 'url' && responseFormat !== 'b64_json') {
            setResponseFormat('url'); // Default to url if invalid
        }
    }

  }, [selectedProviderId, selectedModelId, responseFormat, setSelectedModelId]);


  // --- Event Handlers ---
  const handleProviderChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedProviderId(event.target.value);
    setFormError(null);
  };

  const handleModelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedModelId(event.target.value || null);
    setFormError(null);
  };

  const handlePromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
    setFormError(null);
  };

  const handleRandomSeed = () => {
    setSeedInputValue(String(Date.now()));
    setFormError(null);
  };

  // --- Form Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!selectedModelId || !prompt) {
      setFormError(!selectedModelId ? "Please select a model." : "Please enter a prompt.");
      return;
    }

    let requestBody: ApiRequestBody | null = null;

    try {
      if (selectedProviderId === "xai") {
        if (n < 1 || n > 10) {
          throw new Error("Number of images (n) must be between 1 and 10 for xAI.");
        }
        requestBody = { prompt, model: selectedModelId, n: n, response_format: responseFormat as "url" | "b64_json" };
      } else if (selectedProviderId === "pollinations") {
        const parsedSeed = parseInt(seedInputValue, 10);
        const parsedWidth = parseInt(widthInputValue, 10);
        const parsedHeight = parseInt(heightInputValue, 10);
        if (isNaN(parsedSeed)) throw new Error("Seed must be a valid integer for Pollinations.");
        if (isNaN(parsedWidth) || parsedWidth <= 0) throw new Error("Width must be a positive number for Pollinations.");
        if (isNaN(parsedHeight) || parsedHeight <= 0) throw new Error("Height must be a positive number for Pollinations.");
        requestBody = { prompt, model: selectedModelId, seed: parsedSeed, width: parsedWidth, height: parsedHeight, nologo, private: privateImage, enhance };
      } else if (selectedProviderId === "together") {
        const parsedWidth = parseInt(widthInputValue, 10);
        const parsedHeight = parseInt(heightInputValue, 10);
        const parsedSteps = parseInt(stepsInputValue, 10);
        if (n < 1 || n > 4) throw new Error("Number of images (n) must be between 1 and 4 for Together.");
        if (isNaN(parsedWidth) || parsedWidth <= 0) throw new Error("Width must be a positive number for Together.");
        if (isNaN(parsedHeight) || parsedHeight <= 0) throw new Error("Height must be a positive number for Together.");
        if (isNaN(parsedSteps) || parsedSteps <= 0) throw new Error("Steps must be a positive number for Together.");
        requestBody = { prompt, model: selectedModelId, width: parsedWidth, height: parsedHeight, steps: parsedSteps, n: n, response_format: responseFormat as "url" | "base64" };
      } else if (selectedProviderId === "google") {
        requestBody = { prompt: `Generate ${n} images of\n\n${prompt}`, model: selectedModelId };
      } else {
        throw new Error(`Unsupported provider selected: ${selectedProviderId}`);
      }

      // Call the parent's generation function
      onGenerate(selectedProviderId, requestBody);

    } catch (err: unknown) {
      console.error("Form validation/submission error:", err);
      setFormError(err instanceof Error ? `Invalid input: ${err.message}` : "An unknown form error occurred.");
    }
  };

  // Generic handler for numeric inputs with validation/clamping
  const handleNumericInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>,
    inputSetter?: React.Dispatch<React.SetStateAction<string>> | null, // Make optional
    min: number | null = null,
    max: number | null = null,
    allowFloat: boolean = false
  ) => {
    const newValue = event.target.value;
    if (inputSetter) inputSetter(newValue); // Update display value immediately if provided
    setFormError(null); // Clear error on input change

    // Allow empty string or just a negative sign or decimal point temporarily
    if (
      newValue === "" ||
      newValue === "-" ||
      (allowFloat && newValue === ".") ||
      (allowFloat && newValue === "-.")
    ) {
      return;
    }

    const parsedValue = allowFloat
      ? parseFloat(newValue)
      : parseInt(newValue, 10);

    if (!isNaN(parsedValue)) {
      let clampedValue = parsedValue;
      if (min !== null && !isNaN(min)) clampedValue = Math.max(min, clampedValue);
      if (max !== null && !isNaN(max)) clampedValue = Math.min(max, clampedValue);

      setter(clampedValue); // Update the actual numeric state

      // If the clamped value is different from input, update input display too
      // Avoid updating if the input is just a partial number like '1.'
      if (
        clampedValue.toString() !== newValue &&
        !(allowFloat && newValue.endsWith(".")) &&
        !(allowFloat && newValue.endsWith(".0")) // Handle cases like 1.0
      ) {
         // Update input only if clamping actually changed the value representation
         // or if the input was invalid (e.g., letters)
         if (parsedValue !== clampedValue || newValue !== parsedValue.toString()) {
            if (inputSetter) inputSetter(clampedValue.toString());
         }
      }
    } else {
        setFormError(`Invalid number format for ${event.target.name || 'input'}.`);
    }
  };

  // --- Render Logic ---
  const currentProvider = providers.find((p) => p.id === selectedProviderId);
  const availableModels = currentProvider?.models || [];

  return (
    <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          Parameters
        </h2>

        {/* Provider and Model Selection */}
        <ProviderModelSelector
          providers={providers}
          selectedProviderId={selectedProviderId}
          onProviderChange={handleProviderChange}
          selectedModelId={selectedModelId}
          onModelChange={handleModelChange}
          isLoading={isLoading}
          availableModels={availableModels}
        />

        {/* Prompt Input */}
        <PromptInput
          prompt={prompt}
          onPromptChange={handlePromptChange}
          isLoading={isLoading}
        />

        {/* Number of Images Input */}
        <NumberInput
          label={`Images (${selectedProviderId === "xai" ? "1-10" : "1-4"})`}
          value={n}
          setValue={setN}
          min={1}
          max={selectedProviderId === "xai" ? 10 : 4}
          disabled={isLoading}
          handleNumericInputChange={handleNumericInputChange}
        />


        {/* --- Conditionally Rendered Parameters --- */}

        {/* Parameters for xAI */}
        {selectedProviderId === "xai" && (
          <XaiOptions
            responseFormat={responseFormat as "url" | "b64_json"}
            setResponseFormat={setResponseFormat}
            isLoading={isLoading}
            setFormError={setFormError}
          />
        )}

        {/* Parameters for Together */}
        {selectedProviderId === "together" && (
          <TogetherOptions
            widthInputValue={widthInputValue}
            setWidthInputValue={setWidthInputValue}
            heightInputValue={heightInputValue}
            setHeightInputValue={setHeightInputValue}
            stepsInputValue={stepsInputValue}
            setStepsInputValue={setStepsInputValue}
            responseFormat={responseFormat as "url" | "base64"}
            setResponseFormat={setResponseFormat}
            isLoading={isLoading}
            handleNumericInputChange={handleNumericInputChange}
            setFormError={setFormError}
          />
        )}

        {/* Parameters for Pollinations */}
        {selectedProviderId === "pollinations" && (
          <PollinationsOptions
            widthInputValue={widthInputValue}
            setWidthInputValue={setWidthInputValue}
            heightInputValue={heightInputValue}
            setHeightInputValue={setHeightInputValue}
            seedInputValue={seedInputValue}
            setSeedInputValue={setSeedInputValue}
            nologo={nologo}
            setNologo={setNologo}
            privateImage={privateImage}
            setPrivateImage={setPrivateImage}
            enhance={enhance}
            setEnhance={setEnhance}

            isLoading={isLoading}
            handleNumericInputChange={handleNumericInputChange}
            handleRandomSeed={handleRandomSeed}
          />
        )}

         {/* Display Form Error */}
         {formError && (
            <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-md">
                {formError}
            </div>
         )}


        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !selectedModelId} // Disable if loading or no model selected
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="-ml-1 mr-2 h-5 w-5" />
              Generate Images
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ParametersForm;
