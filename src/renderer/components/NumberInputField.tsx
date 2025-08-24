import { TextField } from "@mui/material";
import { useState, useEffect, useRef } from "react";

export interface NumberInputFieldProps {
  value: number;
  onChange: (value: number) => void;
  allowFloat?: boolean; // if false, only integers allowed
  onBlur?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function NumberInputField({
  value,
  onChange,
  allowFloat = true,
  onBlur,
  onKeyDown,
  onKeyUp,
}: NumberInputFieldProps) {
  const [inputValue, setInputValue] = useState<string>(value.toString());
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const isValidInput = (input: string) => {
    if (input === "" || input === "-") return true;
    if (!allowFloat) {
      // Only allow integers
      return /^-?\d*$/.test(input);
    }
    // Allow numbers ending with a dot (like "5.")
    if (/^-?\d+\.$/.test(input)) return true;
    // Allow floats, scientific notation
    return /^-?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(input);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    setInputValue(val);
    if (isValidInput(val)) {
      if (val.endsWith(".") && allowFloat) return;
      const parsed = allowFloat ? parseFloat(val) : parseInt(val, 10);
      if (!isNaN(parsed) && isFinite(parsed)) {
        onChange(parsed);
      }
    }
  };

  const handleBlur = () => {
    let parsed = allowFloat ? parseFloat(inputValue) : parseInt(inputValue, 10);
    if (isNaN(parsed)) parsed = 0;
    setInputValue(parsed.toString());
    onChange(parsed);
    onBlur?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) onKeyDown(event);
    // Optionally, restrict input here if needed
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyUp) onKeyUp(event);
  };

  return (
    <TextField
      inputRef={ref}
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
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
  );
}
