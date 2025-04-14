import React, { Dispatch, SetStateAction } from 'react';

interface XaiOptionsProps {
  responseFormat: "url" | "b64_json";
  setResponseFormat: Dispatch<SetStateAction<"url" | "b64_json" | "base64">>;
  isLoading: boolean;
  setFormError: Dispatch<SetStateAction<string | null>>;
}

export function XaiOptions({
  responseFormat,
  setResponseFormat,
  isLoading,
  setFormError,
}: XaiOptionsProps) {
  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <h3 className="text-md font-semibold text-gray-600">xAI Options</h3>
      <div className="grid grid-cols-1 gap-4">
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