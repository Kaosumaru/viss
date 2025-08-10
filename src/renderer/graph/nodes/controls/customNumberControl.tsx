import { useState, useEffect } from "react";
import { Box, TextField } from "@mui/material";
import { CustomParamControl } from "./customParamControl";
import type { ParameterValue } from "@graph/parameter";
import type { Parameter } from "@compiler/nodes/compilerNode";

export class NumberControl extends CustomParamControl {
  constructor(
    value: ParameterValue | undefined,
    parameter: Parameter,
    onChange?: (value: ParameterValue) => void
  ) {
    super(value ?? { type: "number", value: 0 }, parameter, onChange);
  }
}

export function CustomNumberControl(props: { data: NumberControl }) {
  const control = props.data;
  const [value, setValue] = useState(control.value);
  const [inputValue, setInputValue] = useState<string>(() => {
    const numberValue = value.type === "number" ? value.value : 0;
    return numberValue.toString();
  });

  useEffect(() => {
    setValue(control.value);
    const newNumberValue =
      control.value.type === "number" ? control.value.value : 0;
    setInputValue(newNumberValue.toString());
  }, [control.value]);

  const isValidNumberInput = (input: string): boolean => {
    // Allow empty string (will default to 0)
    if (input === "" || input === "-") return true;

    // Check if it's a valid number (including decimals, negative numbers, scientific notation)
    const numberRegex = /^-?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;
    return numberRegex.test(input);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = event.target.value;

    // Always update the input value for immediate visual feedback
    setInputValue(inputVal);

    // Only update the actual value if it's valid or empty
    if (isValidNumberInput(inputVal)) {
      const newValue =
        inputVal === "" || inputVal === "-" ? 0 : parseFloat(inputVal);

      // Only update if the parsed value is a valid number
      if (!isNaN(newValue) && isFinite(newValue)) {
        control.value = {
          type: "number",
          value: newValue,
        };
        setValue(control.value);
        control.onChange?.(control.value);
      }
    }

    event.stopPropagation();
    event.preventDefault();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if (
      [8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
      (event.keyCode === 65 && event.ctrlKey === true) ||
      (event.keyCode === 67 && event.ctrlKey === true) ||
      (event.keyCode === 86 && event.ctrlKey === true) ||
      (event.keyCode === 88 && event.ctrlKey === true) ||
      (event.keyCode === 90 && event.ctrlKey === true) ||
      // Allow: home, end, left, right, down, up
      (event.keyCode >= 35 && event.keyCode <= 40)
    ) {
      return; // Let it happen, don't do anything
    }

    const char = String.fromCharCode(event.keyCode);
    const input = (event.target as HTMLInputElement).value;
    const selectionStart =
      (event.target as HTMLInputElement).selectionStart || 0;
    const newInput =
      input.slice(0, selectionStart) + char + input.slice(selectionStart);

    // Allow numbers, decimal point, minus sign, and scientific notation
    if (!/[.\d\-eE]/.test(char)) {
      event.preventDefault();
      return;
    }

    // Prevent invalid number combinations
    if (!isValidNumberInput(newInput)) {
      event.preventDefault();
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const handleBlur = () => {
    // On blur, ensure we have a valid number and sync the display
    const numValue = parseFloat(inputValue);
    const finalValue = isNaN(numValue) ? 0 : numValue;

    setInputValue(finalValue.toString());

    if (control.value.type === "number" && control.value.value !== finalValue) {
      control.value = {
        type: "number",
        value: finalValue,
      };
      setValue(control.value);
      control.onChange?.(control.value);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {control.parameter.description && (
        <Box sx={{ fontSize: "0.8rem", color: "#ccc" }}>
          {control.parameter.description}
        </Box>
      )}

      <TextField
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={handleBlur}
        size="small"
        variant="outlined"
        sx={{
          "& .MuiInputBase-root": {
            color: "#fff",
            backgroundColor: "#2d2d30",
            "& fieldset": {
              borderColor: "#555",
            },
            "&:hover fieldset": {
              borderColor: "#c9b144",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#c9b144",
            },
          },
          "& .MuiInputBase-input": {
            padding: "6px 8px",
            fontSize: "0.9rem",
          },
        }}
      />
    </Box>
  );
}
