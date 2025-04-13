import React from 'react';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
}

export function PromptInput({
  prompt,
  onPromptChange,
  isLoading,
}: PromptInputProps) {
  return (
    <div>
      <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
        Prompt <span className="text-red-500">*</span>
      </label>
      <textarea id="prompt" name="prompt" rows={4}
        value={prompt}
        onChange={onPromptChange}
        placeholder="e.g., A cat wearing a wizard hat"
        required
        disabled={isLoading}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out disabled:opacity-50"
      />
    </div>
  );
}