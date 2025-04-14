import React, { Dispatch, SetStateAction } from 'react';

interface TogetherOptionsProps {
  widthInputValue: string;
  setWidthInputValue: Dispatch<SetStateAction<string>>;
  heightInputValue: string;
  setHeightInputValue: Dispatch<SetStateAction<string>>;
  stepsInputValue: string;
  setStepsInputValue: Dispatch<SetStateAction<string>>;
  responseFormat: "url" | "base64";
  setResponseFormat: Dispatch<SetStateAction<"url" | "base64" | "b64_json">>;
  handleNumericInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: Dispatch<SetStateAction<number>>,
    inputSetter?: Dispatch<SetStateAction<string>> | null,
    min?: number | null,
    max?: number | null
  ) => void;
  isLoading: boolean;
  setFormError: Dispatch<SetStateAction<string | null>>;
}

export function TogetherOptions({
  widthInputValue,
  setWidthInputValue,
  heightInputValue,
  setHeightInputValue,
  stepsInputValue,
  setStepsInputValue,
  responseFormat,
  setResponseFormat,
  handleNumericInputChange,
  isLoading,
  setFormError,
}: TogetherOptionsProps) {

  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <h3 className="text-md font-semibold text-gray-600">
        Together Options
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="width-together" className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
          <input type="number" id="width-together" name="width-together" step="64" min="256" max="2048"
            value={widthInputValue}
            onChange={(e) => handleNumericInputChange(e, () => {}, setWidthInputValue, 1)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="height-together" className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
          <input type="number" id="height-together" name="height-together" step="64" min="256" max="2048"
            value={heightInputValue}
            onChange={(e) => handleNumericInputChange( e, () => {}, setHeightInputValue, 1)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out disabled:opacity-50"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="steps-together" className="block text-sm font-medium text-gray-700 mb-1">Steps</label>
          <input type="number" id="steps-together" name="steps-together" min="1"
            value={stepsInputValue}
            onChange={(e) => handleNumericInputChange(e, () => {}, setStepsInputValue, 1)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="responseFormat-together" className="block text-sm font-medium text-gray-700 mb-1">Response Format</label>
          <select id="responseFormat-together" name="responseFormat-together"
            value={responseFormat}
            onChange={(e) => {setResponseFormat(e.target.value as "url" | "base64" | "b64_json"); setFormError(null);}}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out disabled:opacity-50"
          >
            <option value="url">URL</option>
            <option value="base64">Base64</option>
          </select>
        </div>
      </div>
    </div>
  );
}