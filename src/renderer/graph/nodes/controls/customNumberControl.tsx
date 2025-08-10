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

    // Allow numbers ending with a dot (like "5." for intermediate input)
    if (/^-?\d+\.$/.test(input)) return true;

    // Check if it's a valid number (including decimals, negative numbers, scientific notation)
    const numberRegex = /^-?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;
    return numberRegex.test(input);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = event.target.value;

    // Always update the input value for immediate visual feedback
    setInputValue(inputVal);

    // Only update the actual control value if it's valid and can be parsed
    if (isValidNumberInput(inputVal)) {
      // For inputs ending with just a dot (like "5."), don't update the control value yet
      if (
        inputVal.endsWith(".") &&
        !inputVal.includes("e") &&
        !inputVal.includes("E")
      ) {
        // Keep the display updated but don't change the control value
        event.stopPropagation();
        return;
      }

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
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;
    const input = (event.target as HTMLInputElement).value;
    const selectionStart =
      (event.target as HTMLInputElement).selectionStart || 0;
    const selectionEnd = (event.target as HTMLInputElement).selectionEnd || 0;

    // Allow navigation and editing keys
    if (
      [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "Home",
        "End",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ].includes(key)
    ) {
      return; // Let these keys work normally
    }

    // Allow Ctrl/Cmd combinations (copy, paste, select all, etc.)
    if (event.ctrlKey || event.metaKey) {
      return; // Let these combinations work normally
    }

    // For regular character input, check if it would create a valid number
    const newInput =
      input.slice(0, selectionStart) + key + input.slice(selectionEnd);

    // Allow only valid number characters and check if the resulting input would be valid
    if (!/[.\d\-eE]/.test(key) || !isValidNumberInput(newInput)) {
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
