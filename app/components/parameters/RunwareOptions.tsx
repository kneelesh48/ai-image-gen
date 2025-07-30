import React, { ChangeEvent } from "react";
import { RefreshCw } from "lucide-react";

import type { ILora } from "./types";

interface RunwareOptionsProps {
  widthInputValue: string;
  setWidthInputValue: React.Dispatch<React.SetStateAction<string>>;
  heightInputValue: string;
  setHeightInputValue: React.Dispatch<React.SetStateAction<string>>;
  stepsInputValue: string;
  setStepsInputValue: React.Dispatch<React.SetStateAction<string>>;
  cfgScaleInputValue: string;
  setCfgScaleInputValue: React.Dispatch<React.SetStateAction<string>>;
  seedInputValue: string;
  setSeedInputValue: React.Dispatch<React.SetStateAction<string>>;
  negativePrompt: string;
  setNegativePrompt: React.Dispatch<React.SetStateAction<string>>;
  outputType: "URL" | "base64Data" | "dataURI";
  setOutputType: React.Dispatch<
    React.SetStateAction<"URL" | "base64Data" | "dataURI">
  >;
  loras: ILora[];
  setLoras: React.Dispatch<React.SetStateAction<ILora[]>>;

  isLoading: boolean;
  handleNumericInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>,
    inputSetter?: React.Dispatch<React.SetStateAction<string>> | null,
    min?: number | null,
    max?: number | null,
    allowFloat?: boolean
  ) => void;
  handleRandomSeed: () => void;
  setFormError: React.Dispatch<React.SetStateAction<string | null>>;
}

const RunwareOptions: React.FC<RunwareOptionsProps> = ({
  widthInputValue,
  setWidthInputValue,
  heightInputValue,
  setHeightInputValue,
  stepsInputValue,
  setStepsInputValue,
  cfgScaleInputValue,
  setCfgScaleInputValue,
  seedInputValue,
  setSeedInputValue,
  negativePrompt,
  setNegativePrompt,
  outputType,
  setOutputType,
  loras,
  setLoras,
  isLoading,
  handleNumericInputChange,
  handleRandomSeed,
  setFormError,
}) => {
  const handleLoraChange = (
    index: number,
    field: "model" | "weight",
    value: string
  ) => {
    const newLoras = [...loras];
    if (field === "model") {
      newLoras[index].model = value;
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        newLoras[index].weight = numValue;
      }
    }
    setLoras(newLoras);
  };

  const addLora = () => {
    setLoras([...loras, { model: "neelesh:1@1", weight: 1.0 }]);
  };

  const removeLora = (index: number) => {
    setLoras(loras.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="width"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Width
          </label>
          <input
            type="number"
            id="width"
            name="width"
            value={widthInputValue}
            onChange={(e) =>
              handleNumericInputChange(
                e,
                () => {},
                setWidthInputValue,
                64,
                2048
              )
            }
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            min="64"
            max="2048"
          />
        </div>
        <div>
          <label
            htmlFor="height"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Height
          </label>
          <input
            type="number"
            id="height"
            name="height"
            value={heightInputValue}
            onChange={(e) =>
              handleNumericInputChange(
                e,
                () => {},
                setHeightInputValue,
                64,
                2048
              )
            }
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            min="64"
            max="2048"
          />
        </div>
      </div>

      {/* Steps and CFG Scale */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="steps"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Steps
          </label>
          <input
            type="number"
            id="steps"
            name="steps"
            value={stepsInputValue}
            onChange={(e) =>
              handleNumericInputChange(e, () => {}, setStepsInputValue, 1, 50)
            }
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            min="1"
            max="50"
          />
        </div>
        <div>
          <label
            htmlFor="cfgScale"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            CFG Scale
          </label>
          <input
            type="number"
            id="cfgScale"
            name="cfgScale"
            value={cfgScaleInputValue}
            onChange={(e) =>
              handleNumericInputChange(
                e,
                () => {},
                setCfgScaleInputValue,
                1,
                20,
                true
              )
            }
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            min="1"
            max="20"
            step="0.1"
          />
        </div>
      </div>

      {/* Seed */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="seed"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Seed
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              id="seed"
              name="seed"
              value={seedInputValue}
              onChange={(e) => {
                setSeedInputValue(e.target.value);
                setFormError(null);
              }}
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              placeholder="Random seed"
            />
            <button
              type="button"
              onClick={handleRandomSeed}
              title="Randomize Seed"
              disabled={isLoading}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition duration-150 flex-shrink-0 disabled:opacity-50"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Negative Prompt */}
      <div>
        <label
          htmlFor="negativePrompt"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Negative Prompt
        </label>
        <textarea
          id="negativePrompt"
          name="negativePrompt"
          value={negativePrompt}
          onChange={(e) => {
            setNegativePrompt(e.target.value);
            setFormError(null);
          }}
          disabled={isLoading}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 resize-none"
          placeholder="What you don't want in the image..."
        />
      </div>

      {/* Output Type */}
      <div>
        <label
          htmlFor="outputType"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Output Type
        </label>
        <select
          id="outputType"
          name="outputType"
          value={outputType}
          onChange={(e) => {
            setOutputType(e.target.value as "URL" | "base64Data" | "dataURI");
            setFormError(null);
          }}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
        >
          <option value="URL">URL</option>
          <option value="base64Data">Base64 Data</option>
          <option value="dataURI">Data URI</option>
        </select>
      </div>

      {/* LoRA Models */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            LoRA Models
          </label>
          <button
            type="button"
            onClick={addLora}
            disabled={isLoading}
            className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm rounded-md disabled:opacity-50"
          >
            + Add LoRA
          </button>
        </div>

        {loras.map((lora, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 mb-2">
            <div className="col-span-8">
              <input
                type="text"
                value={lora.model}
                onChange={(e) =>
                  handleLoraChange(index, "model", e.target.value)
                }
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-sm"
                placeholder="LoRA model identifier"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                value={lora.weight}
                onChange={(e) =>
                  handleLoraChange(index, "weight", e.target.value)
                }
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-sm"
                placeholder="Weight"
                step="0.1"
                min="0"
                max="2"
              />
            </div>
            <div className="col-span-1">
              <button
                type="button"
                onClick={() => removeLora(index)}
                disabled={isLoading}
                className="w-full px-2 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md disabled:opacity-50"
              >
                x
              </button>
            </div>
          </div>
        ))}

        {loras.length === 0 && (
          <p className="text-sm text-gray-500 italic">No LoRA models added</p>
        )}
      </div>
    </div>
  );
};

export { RunwareOptions };
