import { useState, useEffect } from "react";
import { Box, Popover, TextField, Paper } from "@mui/material";
import { CustomParamControl } from "./customParamControl";
import type { ParameterValue } from "@graph/parameter";
import type { Parameter } from "@compiler/nodes/compilerNode";

export class ColorControl extends CustomParamControl {
  constructor(
    value: ParameterValue | undefined,
    parameter: Parameter,
    onChange?: (value: ParameterValue) => void
  ) {
    super(value ?? { type: "color", value: "#ffffff" }, parameter, onChange);
  }
}

// Helper function to convert HEX to RGB for color picker
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Helper function to convert RGB to HEX
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

// Simple color picker component
function ColorPicker({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) {
  const rgb = hexToRgb(color) || { r: 255, g: 255, b: 255 };
  const [r, setR] = useState(rgb.r);
  const [g, setG] = useState(rgb.g);
  const [b, setB] = useState(rgb.b);

  useEffect(() => {
    const newRgb = hexToRgb(color);
    if (newRgb) {
      setR(newRgb.r);
      setG(newRgb.g);
      setB(newRgb.b);
    }
  }, [color]);

  const handleColorChange = (component: "r" | "g" | "b", value: number) => {
    const newValues = { r, g, b, [component]: value };
    const newHex = rgbToHex(newValues.r, newValues.g, newValues.b);
    onChange(newHex);
  };

  return (
    <Paper sx={{ p: 2, minWidth: 200 }}>
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            width: "100%",
            height: 40,
            backgroundColor: color,
            border: "1px solid #ccc",
            borderRadius: 1,
            mb: 1,
          }}
        />
        <TextField
          label="HEX"
          value={color}
          onChange={(e) => {
            const hex = e.target.value;
            if (/^#[0-9A-F]{0,6}$/i.test(hex)) {
              onChange(hex);
            }
          }}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ minWidth: 20, color: "#ff4444" }}>R:</Box>
          <input
            type="range"
            min="0"
            max="255"
            value={r}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setR(value);
              handleColorChange("r", value);
            }}
            style={{ flex: 1 }}
          />
          <Box sx={{ minWidth: 30, fontSize: "0.8rem" }}>{r}</Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ minWidth: 20, color: "#44ff44" }}>G:</Box>
          <input
            type="range"
            min="0"
            max="255"
            value={g}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setG(value);
              handleColorChange("g", value);
            }}
            style={{ flex: 1 }}
          />
          <Box sx={{ minWidth: 30, fontSize: "0.8rem" }}>{g}</Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ minWidth: 20, color: "#4444ff" }}>B:</Box>
          <input
            type="range"
            min="0"
            max="255"
            value={b}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setB(value);
              handleColorChange("b", value);
            }}
            style={{ flex: 1 }}
          />
          <Box sx={{ minWidth: 30, fontSize: "0.8rem" }}>{b}</Box>
        </Box>
      </Box>
    </Paper>
  );
}

export function CustomColorControl(props: { data: ColorControl }) {
  const control = props.data;
  const [value, setValue] = useState(control.value);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const colorValue = value.type === "color" ? value.value : "#ffffff";

  useEffect(() => {
    setValue(control.value);
  }, [control.value]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (newColor: string) => {
    control.value = {
      type: "color",
      value: newColor,
    };
    setValue(control.value);
    control.onChange?.(control.value);
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {control.parameter.description && (
        <Box sx={{ fontSize: "0.8rem", color: "#ccc" }}>
          {control.parameter.description}
        </Box>
      )}

      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          padding: 1,
          border: "1px solid #555",
          borderRadius: 1,
          backgroundColor: "#2d2d30",
          "&:hover": {
            backgroundColor: "#3e3e42",
          },
        }}
      >
        <Box
          sx={{
            width: 20,
            height: 20,
            backgroundColor: colorValue,
            border: "1px solid #666",
            borderRadius: 1,
            flexShrink: 0,
          }}
        />
        <Box
          sx={{ fontSize: "0.9rem", color: "#fff", fontFamily: "monospace" }}
        >
          {colorValue.toUpperCase()}
        </Box>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <ColorPicker color={colorValue} onChange={handleColorChange} />
      </Popover>
    </Box>
  );
}
