import React from 'react';
import type { Provider, Model } from './types';

interface ProviderModelSelectorProps {
  providers: Provider[];
  selectedProviderId: string;
  selectedModelId: string | null;
  onProviderChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onModelChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  isLoading: boolean;
  availableModels: Model[];
}

export function ProviderModelSelector({
  providers,
  selectedProviderId,
  selectedModelId,
  onProviderChange,
  onModelChange,
  isLoading,
  availableModels,
}: ProviderModelSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
        <select id="provider" name="provider"
          value={selectedProviderId}
          onChange={onProviderChange}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out disabled:opacity-50"
        >
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
        <select id="model" name="model"
          value={selectedModelId ?? ""}
          onChange={onModelChange}
          disabled={!availableModels.length || isLoading}
          className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out disabled:bg-gray-100 disabled:opacity-50"
        >
          {availableModels.length > 0 ? (
            availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No models available
            </option>
          )}
        </select>
      </div>
    </div>
  );
}