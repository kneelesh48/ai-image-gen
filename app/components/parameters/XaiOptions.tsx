import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';

interface XaiOptionsProps {
  n: number;
  setN: Dispatch<SetStateAction<number>>;
  responseFormat: "url" | "b64_json";
  setResponseFormat: Dispatch<SetStateAction<"url" | "b64_json" | "base64">>;
  isLoading: boolean;
  handleNumericInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: Dispatch<SetStateAction<number>>, // The numeric state setter (e.g., setN)
    inputSetter?: Dispatch<SetStateAction<string>> | null, // The string input state setter (optional now)
    min?: number | null, // Optional to match source signature
    max?: number | null  // Optional to match source signature
  ) => void;
  setFormError: Dispatch<SetStateAction<string | null>>; // Added for response format change
}

export function XaiOptions({
  n,
  setN,
  responseFormat,
  setResponseFormat,
  isLoading,
  handleNumericInputChange,
  setFormError,
}: XaiOptionsProps) {
  const [nInputValue, setNInputValue] = useState(String(n));

  useEffect(() => {
    setNInputValue(String(n));
  }, [n]);

  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <h3 className="text-md font-semibold text-gray-600">xAI Options</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="n-xai" className="block text-sm font-medium text-gray-700 mb-1">Images (1-10)</label>
          <input type="number" id="n-xai" name="n-xai" min="1" max="10" value={nInputValue}
            onChange={(e) => handleNumericInputChange(e, setN, setNInputValue, 1, 10)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="responseFormat-xai" className="block text-sm font-medium text-gray-700 mb-1">Response Format</label>
          <select id="responseFormat-xai" name="responseFormat-xai" value={responseFormat}
            onChange={(e) => { setResponseFormat(e.target.value as "url" | "b64_json"); setFormError(null);}}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out disabled:opacity-50"
          >
            <option value="url">URL</option>
            <option value="b64_json">Base64 JSON</option>
          </select>
        </div>
      </div>
    </div>
  );
}