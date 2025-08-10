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
  const numberValue = value.type === "number" ? value.value : 0;

  useEffect(() => {
    setValue(control.value);
  }, [control.value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value) || 0;
    control.value = {
      type: "number",
      value: newValue,
    };
    setValue(control.value);
    control.onChange?.(control.value);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {control.parameter.description && (
        <Box sx={{ fontSize: "0.8rem", color: "#ccc" }}>
          {control.parameter.description}
        </Box>
      )}

      <TextField
        type="number"
        value={numberValue}
        onChange={handleChange}
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
