import { useState, useEffect } from "react";
import { Box, Popover, TextField, Paper } from "@mui/material";
import { CustomParamControl } from "./customParamControl";
import type { Color, ParameterValue } from "@graph/parameter";
import type { Parameter } from "@compiler/nodes/compilerNode";

export class ColorControl extends CustomParamControl {
  constructor(
    value: ParameterValue | undefined,
    parameter: Parameter,
    onChange?: (value: ParameterValue) => void
  ) {
    super(
      value ?? {
        type: "color",
        value: [1, 1, 1, 1],
      },
      parameter,
      onChange
    );
  }
}

// Helper function to convert RGBA to HEX with alpha
function rgbaToHex(color: Color): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(color[0])}${toHex(color[1])}${toHex(color[2])}${toHex(
    color[3]
  )}`;
}

// Helper function to convert HEX (with optional alpha) to RGBA
function hexToRgba(hex: string): Color {
  const cleanHex = hex.replace("#", "");

  if (cleanHex.length === 6) {
    // RGB format
    return [
      parseInt(cleanHex.substr(0, 2), 16),
      parseInt(cleanHex.substr(2, 2), 16),
      parseInt(cleanHex.substr(4, 2), 16),
      1.0,
    ];
  } else if (cleanHex.length === 8) {
    // RGBA format
    return [
      parseInt(cleanHex.substr(0, 2), 16),
      parseInt(cleanHex.substr(2, 2), 16),
      parseInt(cleanHex.substr(4, 2), 16),
      parseInt(cleanHex.substr(6, 2), 16),
    ];
  }

  // Default fallback
  return [1, 1, 1, 1];
}

// Simple color picker component
function ColorPicker({
  color,
  onChange,
}: {
  color: Color;
  onChange: (color: Color) => void;
}) {
  const [r, setR] = useState(color[0]);
  const [g, setG] = useState(color[1]);
  const [b, setB] = useState(color[2]);
  const [a, setA] = useState(color[3]);

  useEffect(() => {
    setR(color[0]);
    setG(color[1]);
    setB(color[2]);
    setA(color[3]);
  }, [color]);

  const handleColorChange = (
    component: "r" | "g" | "b" | "a",
    value: number
  ) => {
    const newColor = { r, g, b, a, [component]: value };
    setR(newColor.r);
    setG(newColor.g);
    setB(newColor.b);
    setA(newColor.a);
    onChange([newColor.r, newColor.g, newColor.b, newColor.a] as Color);
  };

  const handleHexChange = (hex: string) => {
    if (/^#[0-9A-F]{0,8}$/i.test(hex)) {
      if (hex.length === 7 || hex.length === 9) {
        const newColor = hexToRgba(hex);
        setR(newColor[0]);
        setG(newColor[1]);
        setB(newColor[2]);
        setA(newColor[3]);
        onChange(newColor);
      }
    }
  };

  const bgColor = colorToCSS(color);

  return (
    <Paper sx={{ p: 2, minWidth: 200 }}>
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            width: "100%",
            height: 40,
            backgroundColor: bgColor,
            border: "1px solid #ccc",
            borderRadius: 1,
            mb: 1,
            // Checkerboard pattern for transparency preview
            backgroundImage: `
              linear-gradient(45deg, #ccc 25%, transparent 25%), 
              linear-gradient(-45deg, #ccc 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #ccc 75%), 
              linear-gradient(-45deg, transparent 75%, #ccc 75%)
            `,
            backgroundSize: "10px 10px",
            backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              backgroundColor: bgColor,
              borderRadius: 1,
            }}
          />
        </Box>
        <TextField
          label="HEX"
          value={rgbaToHex(color)}
          onChange={(e) => handleHexChange(e.target.value)}
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
            max="100"
            value={Math.round(r * 100)}
            onChange={(e) => {
              const value = parseInt(e.target.value) / 100;
              handleColorChange("r", value);
            }}
            style={{ flex: 1 }}
          />
          <Box sx={{ minWidth: 30, fontSize: "0.8rem" }}>
            {Math.round(r * 100)}%
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ minWidth: 20, color: "#44ff44" }}>G:</Box>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(g * 100)}
            onChange={(e) => {
              const value = parseInt(e.target.value) / 100;
              handleColorChange("g", value);
            }}
            style={{ flex: 1 }}
          />
          <Box sx={{ minWidth: 30, fontSize: "0.8rem" }}>
            {Math.round(g * 100)}%
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ minWidth: 20, color: "#4444ff" }}>B:</Box>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(b * 100)}
            onChange={(e) => {
              const value = parseInt(e.target.value) / 100;
              handleColorChange("b", value);
            }}
            style={{ flex: 1 }}
          />
          <Box sx={{ minWidth: 30, fontSize: "0.8rem" }}>
            {Math.round(b * 100)}%
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ minWidth: 20, color: "#000000" }}>A:</Box>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(a * 100)}
            onChange={(e) => {
              const value = parseInt(e.target.value) / 100;
              handleColorChange("a", value);
            }}
            style={{ flex: 1 }}
          />
          <Box sx={{ minWidth: 30, fontSize: "0.8rem" }}>
            {Math.round(a * 100)}%
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function colorToCSS(color: Color): string {
  return `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${
    color[3]
  })`;
}

export function CustomColorControl(props: { data: ColorControl }) {
  const control = props.data;
  const [value, setValue] = useState(control.value);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const colorValue =
    value.type === "color" ? value.value : ([1, 1, 1, 1.0] as Color);

  useEffect(() => {
    setValue(control.value);
  }, [control.value]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (newColor: Color) => {
    control.value = {
      type: "color",
      value: newColor,
    };
    setValue(control.value);
    control.onChange?.(control.value);
  };

  const open = Boolean(anchorEl);
  const displayText = rgbaToHex(colorValue);

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
            border: "1px solid #666",
            borderRadius: 1,
            flexShrink: 0,
            // Checkerboard pattern for transparency preview
            backgroundImage: `
              linear-gradient(45deg, #666 25%, transparent 25%), 
              linear-gradient(-45deg, #666 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #666 75%), 
              linear-gradient(-45deg, transparent 75%, #666 75%)
            `,
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              backgroundColor: colorToCSS(colorValue),
              borderRadius: 1,
            }}
          />
        </Box>
        <Box
          sx={{ fontSize: "0.8rem", color: "#fff", fontFamily: "monospace" }}
        >
          {displayText}
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
