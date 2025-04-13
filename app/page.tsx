'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface Model {
  id: string;
  name: string;
}

interface Provider {
  id: string;
  name: string;
  models: Model[];
}

// Updated providers list with implemented models
const providers: Provider[] = [
  {
    id: 'pollinations',
    name: 'Pollinations',
    models: [
      { id: 'flux', name: 'flux' },
      { id: 'turbo', name: 'turbo' }
    ],
  },
  {
    id: 'together',
    name: 'Together',
    models: [
      { id: 'black-forest-labs/FLUX.1-schnell-Free', name: 'FLUX.1-schnell-Free' }
    ],
  },
  {
    id: 'xai',
    name: 'xAI',
    models: [
        { id: 'grok-2-image', name: 'grok-2-image' }
    ],
  },
];

// --- Interfaces for API request bodies ---
interface BaseRequestBody {
    prompt: string;
    model: string | null;
}

interface XaiRequestBody extends BaseRequestBody {
  n: number;
  response_format: 'url' | 'b64_json';
}

interface PollinationsRequestBody extends BaseRequestBody {
    seed: number;
    width: number;
    height: number;
    nologo: boolean;
    private: boolean; // Mapped from privateImage state
    enhance: boolean;
    // Note: 'n' and 'response_format' are not sent to this API
}

interface TogetherRequestBody extends BaseRequestBody {
    width: number;
    height: number;
    steps: number;
    // n: number;
    response_format: 'url' | 'base64';
}

// Union type for the request body
type ApiRequestBody = XaiRequestBody | PollinationsRequestBody | TogetherRequestBody;

export default function ImageGeneratorPage() {
  // --- State Variables ---
  const [selectedProviderId, setSelectedProviderId] = useState<string>(providers[0].id);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(providers[0].models[0]?.id || null);
  const [prompt, setPrompt] = useState<string>('young woman in a field of flowers');

  // Common Parameters (with inputs shown conditionally)
  const [n, setN] = useState<number>(1);
  const [nInputValue, setNInputValue] = useState<string>('1');
  const [responseFormat, setResponseFormat] = useState<'url' | 'b64_json' | 'base64'>('b64_json'); // Default to b64_json

  // Provider-Specific Parameters
  const [width, setWidth] = useState<number>(1024);
  const [widthInputValue, setWidthInputValue] = useState<string>('1024');
  const [height, setHeight] = useState<number>(1024);
  const [heightInputValue, setHeightInputValue] = useState<string>('1024');
  const [steps, setSteps] = useState<number>(4); // Together default
  const [stepsInputValue, setStepsInputValue] = useState<string>('4');
  const [seed, setSeed] = useState<number>(() => Date.now()); // Pollinations default
  const [seedInputValue, setSeedInputValue] = useState<string>(() => String(Date.now()));
  const [nologo, setNologo] = useState<boolean>(true); // Pollinations default
  const [privateImage, setPrivateImage] = useState<boolean>(true); // Pollinations default (maps to 'private')
  const [enhance, setEnhance] = useState<boolean>(true); // Pollinations default

  // UI State
  const [generatedImages, setGeneratedImages] = useState<( { url: string } | { b64_json: string } )[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null); // State for generation time

  // --- Effects for localStorage ---
  useEffect(() => {
    const savedProviderId = localStorage.getItem('selectedProviderId');
    const savedModelId = localStorage.getItem('selectedModelId');

    let initialProviderId = providers[0].id;
    let initialModelId = providers[0].models[0]?.id || null;

    if (savedProviderId) {
      const providerExists = providers.some(p => p.id === savedProviderId);
      if (providerExists) {
        initialProviderId = savedProviderId;
        const provider = providers.find(p => p.id === savedProviderId);

        if (savedModelId) {
          const modelExists = provider?.models.some(m => m.id === savedModelId);
          initialModelId = modelExists ? savedModelId : (provider?.models[0]?.id || null);
        } else {
          initialModelId = provider?.models[0]?.id || null;
        }
      }
    }

    setSelectedProviderId(initialProviderId);
    setSelectedModelId(initialModelId);
    // Set initial response format based on provider
    setResponseFormatBasedOnProvider(initialProviderId);
  }, []); // Run only once on mount

  useEffect(() => {
    if (selectedProviderId) {
        localStorage.setItem('selectedProviderId', selectedProviderId);
    }
  }, [selectedProviderId]);

  useEffect(() => {
    if (selectedModelId) {
        localStorage.setItem('selectedModelId', selectedModelId);
    }
  }, [selectedModelId]);

  // --- Helper Functions ---
  const setResponseFormatBasedOnProvider = (providerId: string) => {
    if (providerId === 'xai') {
        setResponseFormat('b64_json');
    } else if (providerId === 'together') {
        setResponseFormat('base64');
    }
    // Pollinations doesn't use response_format input, so no change needed here
  };

  // Generic handler for numeric inputs with validation/clamping
  const handleNumericInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>,
    inputSetter: React.Dispatch<React.SetStateAction<string>>,
    min: number,
    max: number | null = null // Allow null for no max limit (like seed)
  ) => {
    const newValue = event.target.value;
    inputSetter(newValue); // Update display value immediately

    if (newValue === '' || newValue === '-') { // Allow empty or negative sign temporarily
      // Optionally set an error state or visual cue here if desired
    } else {
      const parsedValue = parseInt(newValue, 10);
      if (!isNaN(parsedValue)) {
        let clampedValue = parsedValue;
        if (min !== null) clampedValue = Math.max(min, clampedValue);
        if (max !== null) clampedValue = Math.min(max, clampedValue);

        setter(clampedValue);
        // If the clamped value is different from input, update input display too
        if (clampedValue.toString() !== newValue) {
            inputSetter(clampedValue.toString());
        }
      }
      // If isNaN, the actual state remains unchanged, input shows invalid text
      // Optionally set an error state or visual cue here
    }
  };

  // --- Event Handlers ---
  const handleProviderChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newProviderId = event.target.value;
    setSelectedProviderId(newProviderId);
    const provider = providers.find(p => p.id === newProviderId);

    setSelectedModelId(provider?.models[0]?.id || null);
    setGeneratedImages([]);
    setError(null);
    setGenerationTime(null); // Reset time on provider change

    // Reset relevant parameters or set defaults based on new provider
    setResponseFormatBasedOnProvider(newProviderId);
    // Reset other params to defaults if needed, e.g.:
    // setWidth(1024); setWidthInputValue('1024');
    // setHeight(newProviderId === 'together' ? 768 : 1024); setHeightInputValue(newProviderId === 'together' ? '768' : '1024');
    // setSteps(4); setStepsInputValue('4');
    // setSeed(Date.now()); setSeedInputValue(String(Date.now()));
    // setNologo(true); setPrivateImage(true); setEnhance(false);
  };

  const handleModelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedModelId(event.target.value);
    setGeneratedImages([]);
    setError(null);
    setGenerationTime(null); // Reset time on model change
  };

  // --- Form Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setGenerationTime(null); // Reset time on new submission
    const startTime = performance.now(); // Start timer

    if (!selectedModelId) {
        setError('Please select a model.');
        setIsLoading(false);
        return;
    }
    if (!prompt) {
        setError('Please enter a prompt.');
        setIsLoading(false);
        return;
    }

    let apiUrl = '';
    let requestBody: ApiRequestBody | null = null;

    try {
        // --- Construct Request Body based on Provider ---
        if (selectedProviderId === 'xai') {
            apiUrl = '/api/generate/xai';

            // Validation for 'n' specific to xAI
            const parsedN = parseInt(nInputValue, 10);
            if (nInputValue === '' || isNaN(parsedN) || parsedN < 1 || parsedN > 10) {
                throw new Error('Number of images (n) must be between 1 and 10 for xAI.');
            }

            requestBody = {
                prompt,
                model: selectedModelId,
                n: n, // Use validated numeric state
                response_format: responseFormat as 'url' | 'b64_json', // Cast based on provider context
            };
        } else if (selectedProviderId === 'pollinations') {
            apiUrl = '/api/generate/pollinations';

            // Validation for Pollinations specific fields
            const parsedSeed = parseInt(seedInputValue, 10);
            if (seedInputValue === '' || isNaN(parsedSeed)) {
                 throw new Error('Seed must be a valid number for Pollinations.');
            }
             const parsedWidth = parseInt(widthInputValue, 10);
            if (widthInputValue === '' || isNaN(parsedWidth) || parsedWidth <= 0) {
                 throw new Error('Width must be a positive number for Pollinations.');
            }
             const parsedHeight = parseInt(heightInputValue, 10);
            if (heightInputValue === '' || isNaN(parsedHeight) || parsedHeight <= 0) {
                 throw new Error('Height must be a positive number for Pollinations.');
            }

            requestBody = {
                prompt,
                model: selectedModelId,
                seed: seed, // Use validated numeric state
                width: width, // Use validated numeric state
                height: height, // Use validated numeric state
                nologo: nologo,
                private: privateImage, // Map state variable
                enhance: enhance,
            };
        } else if (selectedProviderId === 'together') {
            apiUrl = '/api/generate/together';

             // Validation for Together specific fields
            const parsedN = parseInt(nInputValue, 10);
            if (nInputValue === '' || isNaN(parsedN) || parsedN < 1 || parsedN > 10) { // Assuming max 10 for Together too
                throw new Error('Number of images (n) must be between 1 and 10 for Together.');
            }
             const parsedWidth = parseInt(widthInputValue, 10);
            if (widthInputValue === '' || isNaN(parsedWidth) || parsedWidth <= 0) {
                 throw new Error('Width must be a positive number for Together.');
            }
             const parsedHeight = parseInt(heightInputValue, 10);
            if (heightInputValue === '' || isNaN(parsedHeight) || parsedHeight <= 0) {
                 throw new Error('Height must be a positive number for Together.');
            }
             const parsedSteps = parseInt(stepsInputValue, 10);
            if (stepsInputValue === '' || isNaN(parsedSteps) || parsedSteps <= 0) {
                 throw new Error('Steps must be a positive number for Together.');
            }

            requestBody = {
                prompt,
                model: selectedModelId,
                width: width, // Use validated numeric state
                height: height, // Use validated numeric state
                steps: steps, // Use validated numeric state
                n: n, // Use validated numeric state
                response_format: responseFormat as 'url' | 'base64', // Cast based on provider context
            };
        } else {
            throw new Error(`Unsupported provider selected: ${selectedProviderId}`);
        }

        // --- API Call ---
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `API error! status: ${response.status}`);
        }

        // --- Process Response ---
        // Adjust based on actual API response structure for each provider if needed
        // Assuming a consistent structure { data: [ { url: "..." } | { b64_json: "..." } ] } for now
        if (data.data && Array.isArray(data.data)) {
            setGeneratedImages(data.data);
        } else if (selectedProviderId === 'together' && data.base64Json) { // Handle Together's specific response
             setGeneratedImages([{ b64_json: data.base64Json }]);
        }
        else {
            console.warn('API response did not contain expected data array:', data);
            setGeneratedImages([]);
            throw new Error('Invalid or empty response format from API.');
        }

    } catch (err: unknown) {
        console.error('Generation failed:', err);
        if (err instanceof Error) {
            setError(`Generation failed: ${err.message}`);
        } else {
            setError('An unknown error occurred during generation.');
        }
        setGeneratedImages([]);
    } finally {
        const endTime = performance.now(); // End timer
        const durationInSeconds = (endTime - startTime) / 1000;
        setGenerationTime(parseFloat(durationInSeconds.toFixed(2))); // Set formatted time
        setIsLoading(false);
    }
  };

  // --- Render Logic ---
  const currentProvider = providers.find(p => p.id === selectedProviderId);
  const availableModels = currentProvider?.models || [];

  // Effect to ensure model selection is valid when provider changes
  useEffect(() => {
      const provider = providers.find(p => p.id === selectedProviderId);
      const firstModelId = provider?.models[0]?.id || null;
      const currentModelIsValid = provider?.models.some(m => m.id === selectedModelId);

      if (!currentModelIsValid) {
          setSelectedModelId(firstModelId);
          if (firstModelId) {
            localStorage.setItem('selectedModelId', firstModelId);
          } else {
            localStorage.removeItem('selectedModelId');
          }
      }
  }, [selectedProviderId, selectedModelId]);


  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">AI Image Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Parameters */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Provider and Model Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <select
                  id="provider"
                  value={selectedProviderId}
                  onChange={handleProviderChange}
                  disabled={isLoading}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                >
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <select
                  id="model"
                  value={selectedModelId ?? ''}
                  onChange={handleModelChange}
                  disabled={!availableModels.length || isLoading}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:opacity-50"
                >
                  {availableModels.length > 0 ? (
                    availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No models available</option>
                  )}
                </select>
              </div>
            </div>

            {/* Prompt Input */}
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                Prompt <span className="text-red-500">*</span>
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                rows={5}
                disabled={isLoading}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                placeholder={"Enter your image generation prompt..."}
              />
            </div>

            {/* --- Conditionally Rendered Parameters --- */}

            {/* xAI Parameters */}
            {selectedProviderId === 'xai' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
                 <h3 className="text-lg font-semibold col-span-full mb-2">xAI Options</h3>
                <div>
                  <label htmlFor="n" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Images (n)
                  </label>
                  <input
                    type="number"
                    id="n"
                    value={nInputValue}
                    onChange={(e) => handleNumericInputChange(e, setN, setNInputValue, 1, 10)}
                    min="1"
                    max="10"
                    disabled={isLoading}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="responseFormat" className="block text-sm font-medium text-gray-700 mb-1">
                    Response Format
                  </label>
                  <select
                    id="responseFormat"
                    value={responseFormat}
                    onChange={(e) => setResponseFormat(e.target.value as 'url' | 'b64_json')}
                    disabled={isLoading}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  >
                    <option value="b64_json">Base64 JSON</option>
                    <option value="url">URL</option>
                  </select>
                </div>
              </div>
            )}

            {/* Together Parameters */}
            {selectedProviderId === 'together' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-4">
                 <h3 className="text-lg font-semibold col-span-full mb-2">Together Options</h3>
                 <div>
                  <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                    Width
                  </label>
                  <input
                    type="number"
                    id="width"
                    value={widthInputValue}
                    onChange={(e) => handleNumericInputChange(e, setWidth, setWidthInputValue, 1)}
                    min="1"
                    disabled={isLoading}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
                 <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                    Height
                  </label>
                  <input
                    type="number"
                    id="height"
                    value={heightInputValue}
                    onChange={(e) => handleNumericInputChange(e, setHeight, setHeightInputValue, 1)}
                    min="1"
                    disabled={isLoading}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
                 <div>
                  <label htmlFor="steps" className="block text-sm font-medium text-gray-700 mb-1">
                    Steps
                  </label>
                  <input
                    type="number"
                    id="steps"
                    value={stepsInputValue}
                    onChange={(e) => handleNumericInputChange(e, setSteps, setStepsInputValue, 1)}
                    min="1"
                    disabled={isLoading}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="n" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Images (n)
                  </label>
                  <input
                    type="number"
                    id="n"
                    value={nInputValue}
                    onChange={(e) => handleNumericInputChange(e, setN, setNInputValue, 1, 10)} // Assuming max 10
                    min="1"
                    max="10"
                    disabled={true}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="responseFormat" className="block text-sm font-medium text-gray-700 mb-1">
                    Response Format
                  </label>
                  <select
                    id="responseFormat"
                    value={responseFormat}
                    onChange={(e) => setResponseFormat(e.target.value as 'url' | 'base64')}
                    disabled={isLoading}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  >
                    <option value="base64">Base64</option>
                    <option value="url">URL</option>
                  </select>
                </div>
              </div>
            )}

            {/* Pollinations Parameters */}
            {selectedProviderId === 'pollinations' && (
              <div className="space-y-4 border-t pt-4 mt-4">
                 <h3 className="text-lg font-semibold mb-2">Pollinations Options</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="seed" className="block text-sm font-medium text-gray-700 mb-1">
                            Seed
                        </label>
                        <input
                            type="number"
                            id="seed"
                            value={seedInputValue}
                            onChange={(e) => handleNumericInputChange(e, setSeed, setSeedInputValue, 0)} // Seed can be 0 or more
                            min="0"
                            disabled={isLoading}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                        />
                    </div>
                    <div>
                        <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                            Width
                        </label>
                        <input
                            type="number"
                            id="width"
                            value={widthInputValue}
                            onChange={(e) => handleNumericInputChange(e, setWidth, setWidthInputValue, 1)}
                            min="1"
                            disabled={isLoading}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                        />
                    </div>
                    <div>
                        <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                            Height
                        </label>
                        <input
                            type="number"
                            id="height"
                            value={heightInputValue}
                            onChange={(e) => handleNumericInputChange(e, setHeight, setHeightInputValue, 1)}
                            min="1"
                            disabled={isLoading}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                        />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="flex items-center">
                        <input
                            id="nologo"
                            type="checkbox"
                            checked={nologo}
                            onChange={(e) => setNologo(e.target.checked)}
                            disabled={isLoading}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        <label htmlFor="nologo" className="ml-2 block text-sm text-gray-900">
                            No Logo
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="privateImage"
                            type="checkbox"
                            checked={privateImage}
                            onChange={(e) => setPrivateImage(e.target.checked)}
                            disabled={isLoading}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        <label htmlFor="privateImage" className="ml-2 block text-sm text-gray-900">
                            Private Image
                        </label>
                    </div>
                     <div className="flex items-center">
                        <input
                            id="enhance"
                            type="checkbox"
                            checked={enhance}
                            onChange={(e) => setEnhance(e.target.checked)}
                            disabled={isLoading}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        <label htmlFor="enhance" className="ml-2 block text-sm text-gray-900">
                            Enhance
                        </label>
                    </div>
                 </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || !prompt || !selectedModelId} // Basic validation, more specific validation in handleSubmit
                className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating...' : 'Generate Image'}
              </button>
            </div>
          </form>

          {/* Generation Time Display */}
          {generationTime !== null && (
            <div className="mt-4 text-sm text-gray-600">
              Generation took: {generationTime} seconds
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Image Display */}
        <div className="pt-0 md:pt-6">
          <h2 className="text-xl font-semibold mb-4">Generated Images</h2>
          <div className="w-full min-h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 relative p-4">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-md">
                <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            {!isLoading && generatedImages.length > 0 && (
              <div className="flex flex-col items-center gap-6 w-full">
                {generatedImages.map((imgData, index) => {
                  const src = 'url' in imgData ? imgData.url : `data:image/png;base64,${imgData.b64_json}`;
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={index}
                      src={src}
                      alt={`Generated image ${index + 1}`}
                      className="max-w-full h-auto object-contain rounded-md border border-gray-300"
                    />
                  );
                })}
              </div>
            )}
            {!isLoading && generatedImages.length === 0 && (
               <span>{error ? 'Generation failed' : 'Images will appear here'}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
