import { Box, Paper, Tab, Tabs, TextField } from "@mui/material";
import { colorToCSS, hexToRgba, rgbaToHex } from "./utils";
import type { Color } from "@graph/parameter";
import { useState, useEffect } from "react";
import { ColorWheel } from "./ColorWheel";

// Simple color picker component
export function ColorPicker({
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
  const [activeTab, setActiveTab] = useState(0);

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
    <Paper sx={{ p: 2, minWidth: 300, maxWidth: 350 }}>
      {/* Color preview */}
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
          onChange={(e) => {
            handleHexChange(e.target.value);
          }}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
        />
      </Box>

      {/* Tabs for switching between color wheel and sliders */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => {
          setActiveTab(newValue as number);
        }}
        sx={{
          mb: 2,
          minHeight: 32,
          "& .MuiTab-root": {
            minHeight: 32,
            fontSize: "0.8rem",
            padding: "6px 12px",
          },
        }}
      >
        <Tab label="Wheel" />
        <Tab label="Sliders" />
      </Tabs>

      {/* Tab content */}
      {activeTab === 0 ? (
        <ColorWheel color={color} onChange={onChange} />
      ) : (
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
      )}
    </Paper>
  );
}
