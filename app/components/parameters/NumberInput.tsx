import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  setValue: Dispatch<SetStateAction<number>>;
  min?: number;
  max?: number;
  disabled?: boolean;
  handleNumericInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: Dispatch<SetStateAction<number>>,
    inputSetter?: Dispatch<SetStateAction<string>> | null,
    min?: number | null,
    max?: number | null
  ) => void;
}

export function NumberInput({
  label,
  value,
  setValue,
  min,
  max,
  disabled = false,
  handleNumericInputChange,
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="n-images" className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type="number"
          id="n-images"
          name="n-images"
          min={min}
          max={max}
          value={inputValue}
          onChange={(e) => handleNumericInputChange(e, setValue, setInputValue, min ?? null, max ?? null)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out disabled:opacity-50"
        />
      </div>
    </div>

  );
}