import React, { Dispatch, SetStateAction } from 'react';
import { RefreshCw, EyeOff, Lock, Sparkles, LucideIcon } from 'lucide-react'; // Import icons

interface PollinationsOptionsProps {
  widthInputValue: string;
  setWidthInputValue: Dispatch<SetStateAction<string>>;
  heightInputValue: string;
  setHeightInputValue: Dispatch<SetStateAction<string>>;
  seedInputValue: string;
  setSeedInputValue: Dispatch<SetStateAction<string>>;
  nologo: boolean;
  setNologo: Dispatch<SetStateAction<boolean>>;
  privateImage: boolean;
  setPrivateImage: Dispatch<SetStateAction<boolean>>;
  enhance: boolean;
  setEnhance: Dispatch<SetStateAction<boolean>>;
  handleNumericInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: Dispatch<SetStateAction<number>>,
    valueSetter: Dispatch<SetStateAction<string>>,
    min: number | null, // Allow null for seed
    max?: number | null, // Allow null for seed
    allowFloat?: boolean // Allow float for seed
  ) => void;
  handleRandomSeed: () => void;
  isLoading: boolean;
}

export function PollinationsOptions({
  widthInputValue,
  setWidthInputValue,
  heightInputValue,
  setHeightInputValue,
  seedInputValue,
  setSeedInputValue,
  nologo,
  setNologo,
  privateImage,
  setPrivateImage,
  enhance,
  setEnhance,
  handleNumericInputChange,
  handleRandomSeed,
  isLoading,
}: PollinationsOptionsProps) {

  const renderToggle = (
    label: string,
    Icon: LucideIcon,
    state: boolean,
    setter: Dispatch<SetStateAction<boolean>>,
    disabled: boolean
  ) => (
    <div className="flex items-center justify-between">
      <label htmlFor={label.toLowerCase().replace(" ", "-")} className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
        <Icon className="w-4 h-4 text-gray-500" />
        {label}
      </label>
      <button type="button" id={label.toLowerCase().replace(" ", "-")}
        onClick={() => setter((prev) => !prev)}
        disabled={disabled}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50
          ${state ? 'bg-indigo-600' : 'bg-gray-200'}`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
            state ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );


  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <h3 className="text-md font-semibold text-gray-600">Pollinations Options</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="width-pollinations" className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
          <input type="number" id="width-pollinations" name="width-pollinations" step="1" min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out disabled:opacity-50"
            value={widthInputValue}
            onChange={(e) => handleNumericInputChange(e, () => {}, setWidthInputValue, 1)}
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="height-pollinations" className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
          <input type="number" id="height-pollinations" name="height-pollinations" step="1" min="1"
            value={heightInputValue}
            onChange={(e) => handleNumericInputChange(e, () => {}, setHeightInputValue, 1)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out disabled:opacity-50"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="seed-pollinations" className="block text-sm font-medium text-gray-700 mb-1">Seed</label>
          <div className="flex gap-2">
            <input type="number" id="seed-pollinations" name="seed-pollinations"
              value={seedInputValue}
              onChange={(e) => setSeedInputValue(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out disabled:opacity-50"
            />
            <button type="button" onClick={handleRandomSeed} title="Randomize Seed" disabled={isLoading}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition duration-150 flex-shrink-0 disabled:opacity-50"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {renderToggle("No Logo", EyeOff, nologo, setNologo, isLoading)}
        {renderToggle( "Private Image", Lock, privateImage, setPrivateImage, isLoading)}
        {renderToggle( "Enhance Prompt", Sparkles, enhance, setEnhance, isLoading)}
      </div>
    </div>
  );
}