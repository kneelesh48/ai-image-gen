"use client";

import { Settings, Wand2, Loader2 } from "lucide-react";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

import { providers } from './parameters/providers';
import type { ApiRequestBody, ILora } from './parameters/types';
import { validateAndBuildRequestBody } from './parameters/utils/formValidation';

import { useParameterPersistence } from './parameters/hooks/useParameterPersistence';
import { useNumericInput } from './parameters/hooks/useNumericInput';
import { useProviderEffects } from './parameters/hooks/useProviderEffects';

import { ProviderModelSelector } from './parameters/ProviderModelSelector';
import { PromptInput } from './parameters/PromptInput';
import { NumberInput } from './parameters/NumberInput';
import { PollinationsOptions } from './parameters/PollinationsOptions';
import { RunwareOptions } from './parameters/RunwareOptions';
import { TogetherOptions } from './parameters/TogetherOptions';
import { XaiOptions } from './parameters/XaiOptions';

interface ParametersFormProps {
  isLoading: boolean;
  onGenerate: (providerId: string, requestBody: ApiRequestBody) => void;
  n: number;
  setN: React.Dispatch<React.SetStateAction<number>>;
}

const ParametersForm: React.FC<ParametersFormProps> = ({ isLoading, onGenerate, n, setN }) => {
  const [selectedProviderId, setSelectedProviderId, selectedModelId, setSelectedModelId,] = useParameterPersistence(providers);

  const [prompt, setPrompt] = useState<string>("A young woman in a field of flowers");

  // Common parameters but not all providers use them
  const [widthInputValue, setWidthInputValue] = useState<string>("1024");
  const [heightInputValue, setHeightInputValue] = useState<string>("1024");
  const [seedInputValue, setSeedInputValue] = useState<string>("");
  const [responseFormat, setResponseFormat] = useState<"url" | "b64_json" | "base64">("url");
  const [stepsInputValue, setStepsInputValue] = useState<string>("");

  // Pollinations specific toggles
  const [nologo, setNologo] = useState<boolean>(true);
  const [privateImage, setPrivateImage] = useState<boolean>(true);
  const [enhance, setEnhance] = useState<boolean>(false);

  // Runware specific parameters
  const [cfgScaleInputValue, setCfgScaleInputValue] = useState<string>("2.5");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [outputType, setOutputType] = useState<"URL" | "base64Data" | "dataURI">("URL");
  const [loras, setLoras] = useState<ILora[]>([]);

  // Internal UI State
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize client-side only values
  useEffect(() => {
    if (seedInputValue === "") {
      setSeedInputValue(String(Date.now()));
    }
  }, []);

  // Effect to ensure model validity and reset response format on provider change
  useProviderEffects(
    selectedProviderId,
    selectedModelId,
    setSelectedModelId,
    responseFormat,
    setResponseFormat,
    setStepsInputValue,
    setOutputType,
    providers
  );

  // --- Event Handlers ---
  const handleProviderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProviderId(event.target.value);
    setFormError(null);
  };

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
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

    try {
      const requestBody = validateAndBuildRequestBody({
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
      });

      onGenerate(selectedProviderId, requestBody);
    } catch (err: unknown) {
      console.error("Form validation/submission error:", err);
      setFormError(err instanceof Error ? `Invalid input: ${err.message}` : "An unknown form error occurred.");
    }
  };

  // Generic handler for numeric inputs with validation/clamping
  const handleNumericInputChange = useNumericInput(setFormError);

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
          label={`Images (${["xai", "runware"].includes(selectedProviderId) ? "1-10": "1-4"})`}
          value={n}
          setValue={setN}
          min={1}
          max={["xai", "runware"].includes(selectedProviderId) ? 10 : 4}
          disabled={isLoading}
          handleNumericInputChange={handleNumericInputChange}
        />

        {/* --- Conditionally Rendered Parameters --- */}

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

        {selectedProviderId === "runware" && (
          <RunwareOptions
            widthInputValue={widthInputValue}
            setWidthInputValue={setWidthInputValue}
            heightInputValue={heightInputValue}
            setHeightInputValue={setHeightInputValue}
            stepsInputValue={stepsInputValue}
            setStepsInputValue={setStepsInputValue}
            cfgScaleInputValue={cfgScaleInputValue}
            setCfgScaleInputValue={setCfgScaleInputValue}
            seedInputValue={seedInputValue}
            setSeedInputValue={setSeedInputValue}
            negativePrompt={negativePrompt}
            setNegativePrompt={setNegativePrompt}
            outputType={outputType}
            setOutputType={setOutputType}
            loras={loras}
            setLoras={setLoras}
            isLoading={isLoading}
            handleNumericInputChange={handleNumericInputChange}
            handleRandomSeed={handleRandomSeed}
            setFormError={setFormError}
          />
        )}

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

        {selectedProviderId === "xai" && (
          <XaiOptions
            responseFormat={responseFormat as "url" | "b64_json"}
            setResponseFormat={setResponseFormat}
            isLoading={isLoading}
            setFormError={setFormError}
          />
        )}

        {/* Display Form Error */}
        {formError && (
          <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-md">
            {formError}
          </div>
        )}

        {/* Submit Button */}
        <div className="sticky bottom-4 z-10">
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
        </div>
      </form>
    </div>
  );
};

export default ParametersForm;
