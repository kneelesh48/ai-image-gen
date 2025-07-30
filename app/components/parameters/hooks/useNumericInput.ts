import { ChangeEvent } from 'react';

export const useNumericInput = (setFormError: React.Dispatch<React.SetStateAction<string | null>>) => {
  const handleNumericInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>,
    inputSetter?: React.Dispatch<React.SetStateAction<string>> | null,
    min: number | null = null,
    max: number | null = null,
    allowFloat: boolean = false
  ) => {
    const newValue = event.target.value;
    if (inputSetter) inputSetter(newValue);
    setFormError(null);

    if (
      newValue === "" ||
      newValue === "-" ||
      (allowFloat && newValue === ".") ||
      (allowFloat && newValue === "-.")
    ) {
      return;
    }

    const parsedValue = allowFloat
      ? parseFloat(newValue)
      : parseInt(newValue, 10);

    if (!isNaN(parsedValue)) {
      let clampedValue = parsedValue;
      if (min !== null && !isNaN(min))
        clampedValue = Math.max(min, clampedValue);
      if (max !== null && !isNaN(max))
        clampedValue = Math.min(max, clampedValue);

      setter(clampedValue);

      if (
        clampedValue.toString() !== newValue &&
        !(allowFloat && newValue.endsWith(".")) &&
        !(allowFloat && newValue.endsWith(".0"))
      ) {
        if (
          parsedValue !== clampedValue ||
          newValue !== parsedValue.toString()
        ) {
          if (inputSetter) inputSetter(clampedValue.toString());
        }
      }
    } else {
      setFormError(
        `Invalid number format for ${event.target.name || "input"}.`
      );
    }
  };

  return handleNumericInputChange;
};