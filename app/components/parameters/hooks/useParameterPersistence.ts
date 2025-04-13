import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import type { Provider } from '../types';

type UseParameterPersistenceReturn = [
  string,
  Dispatch<SetStateAction<string>>,
  string | null,
  Dispatch<SetStateAction<string | null>>
];

export function useParameterPersistence(providers: Provider[]): UseParameterPersistenceReturn {
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  // Effect to initialize state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !providers || providers.length === 0) {
      return;
    }

    const savedProviderId = localStorage.getItem("selectedProviderId");
    const savedModelId = localStorage.getItem("selectedModelId");

    let initialProviderId = providers[0].id;
    let initialModelId = providers[0].models[0]?.id || null;

    if (savedProviderId) {
      const providerExists = providers.some((p) => p.id === savedProviderId);
      if (providerExists) {
        initialProviderId = savedProviderId;
        const provider = providers.find((p) => p.id === savedProviderId);

        if (savedModelId) {
          const modelExists = provider?.models.some(
            (m) => m.id === savedModelId
          );
          initialModelId = modelExists
            ? savedModelId
            : provider?.models[0]?.id || null;
        } else {
          initialModelId = provider?.models[0]?.id || null;
        }
      }
    }

    setSelectedProviderId(initialProviderId);
    setSelectedModelId(initialModelId);
  }, [providers]);

  // Effect to save selectedProviderId to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedProviderId) {
      localStorage.setItem("selectedProviderId", selectedProviderId);
    }
  }, [selectedProviderId]);

  // Effect to save selectedModelId to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedModelId) {
        localStorage.setItem("selectedModelId", selectedModelId);
      } else {
        localStorage.removeItem("selectedModelId");
      }
    }
  }, [selectedModelId]);

  return [selectedProviderId, setSelectedProviderId, selectedModelId, setSelectedModelId];
}