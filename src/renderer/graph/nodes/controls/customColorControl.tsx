import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Popover, TextField, Paper, Tabs, Tab } from "@mui/material";
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
      parseInt(cleanHex.substr(0, 2), 16) / 255,
      parseInt(cleanHex.substr(2, 2), 16) / 255,
      parseInt(cleanHex.substr(4, 2), 16) / 255,
      1.0,
    ];
  } else if (cleanHex.length === 8) {
    // RGBA format
    return [
      parseInt(cleanHex.substr(0, 2), 16) / 255,
      parseInt(cleanHex.substr(2, 2), 16) / 255,
      parseInt(cleanHex.substr(4, 2), 16) / 255,
      parseInt(cleanHex.substr(6, 2), 16) / 255,
    ];
  }

  // Default fallback
  return [1, 1, 1, 1];
}

// HSV to RGB conversion
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return [r + m, g + m, b + m];
}

// RGB to HSV conversion
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;

  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return [h, s, v];
}

// Color wheel component
function ColorWheel({
  color,
  onChange,
}: {
  color: Color;
  onChange: (color: Color) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svAreaRef = useRef<HTMLCanvasElement>(null);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [value, setValue] = useState(1);
  const [alpha, setAlpha] = useState(color[3]);

  // Convert current color to HSV
  useEffect(() => {
    const [h, s, v] = rgbToHsv(color[0], color[1], color[2]);
    setHue(h);
    setSaturation(s);
    setValue(v);
    setAlpha(color[3]);
  }, [color]);

  const drawHueWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = Math.min(centerX, centerY) - 5;
    const innerRadius = outerRadius - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw hue wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = ((angle - 1) * Math.PI) / 180;
      const endAngle = (angle * Math.PI) / 180;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      const [r, g, b] = hsvToRgb(angle, 1, 1);
      ctx.fillStyle = `rgb(${Math.round(r * 255)}, ${Math.round(
        g * 255
      )}, ${Math.round(b * 255)})`;
      ctx.fill();
    }

    // Draw hue indicator
    const hueAngle = ((hue - 90) * Math.PI) / 180;
    const indicatorRadius = (outerRadius + innerRadius) / 2;
    const indicatorX = centerX + Math.cos(hueAngle) * indicatorRadius;
    const indicatorY = centerY + Math.sin(hueAngle) * indicatorRadius;

    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [hue]);

  const drawSVArea = useCallback(() => {
    const canvas = svAreaRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Create gradient for saturation-value area
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const s = x / width;
        const v = 1 - y / height;
        const [r, g, b] = hsvToRgb(hue, s, v);

        const index = (y * width + x) * 4;
        data[index] = Math.round(r * 255); // Red
        data[index + 1] = Math.round(g * 255); // Green
        data[index + 2] = Math.round(b * 255); // Blue
        data[index + 3] = 255; // Alpha
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw SV indicator
    const svX = saturation * width;
    const svY = (1 - value) * height;

    ctx.beginPath();
    ctx.arc(svX, svY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = value > 0.5 ? "black" : "white";
    ctx.fill();
    ctx.strokeStyle = value > 0.5 ? "white" : "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [hue, saturation, value]);

  useEffect(() => {
    drawHueWheel();
  }, [drawHueWheel]);

  useEffect(() => {
    drawSVArea();
  }, [drawSVArea]);

  const handleHueClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const x = event.clientX - rect.left - centerX;
      const y = event.clientY - rect.top - centerY;

      const distance = Math.sqrt(x * x + y * y);
      const outerRadius = Math.min(centerX, centerY) - 5;
      const innerRadius = outerRadius - 20;

      if (distance >= innerRadius && distance <= outerRadius) {
        let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
        if (angle < 0) angle += 360;

        const newHue = angle;
        setHue(newHue);

        const [r, g, b] = hsvToRgb(newHue, saturation, value);
        onChange([r, g, b, alpha]);
      }
    },
    [saturation, value, alpha, onChange]
  );

  const handleSVClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = svAreaRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newSaturation = Math.max(0, Math.min(1, x / canvas.width));
      const newValue = Math.max(0, Math.min(1, 1 - y / canvas.height));

      setSaturation(newSaturation);
      setValue(newValue);

      const [r, g, b] = hsvToRgb(hue, newSaturation, newValue);
      onChange([r, g, b, alpha]);
    },
    [hue, alpha, onChange]
  );

  const handleAlphaChange = (newAlpha: number) => {
    setAlpha(newAlpha);
    const [r, g, b] = hsvToRgb(hue, saturation, value);
    onChange([r, g, b, newAlpha]);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        {/* Hue wheel */}
        <Box sx={{ position: "relative" }}>
          <canvas
            ref={canvasRef}
            width={120}
            height={120}
            onClick={handleHueClick}
            style={{ cursor: "pointer", display: "block" }}
          />
        </Box>

        {/* Saturation-Value area */}
        <Box sx={{ position: "relative" }}>
          <canvas
            ref={svAreaRef}
            width={120}
            height={120}
            onClick={handleSVClick}
            style={{
              cursor: "pointer",
              display: "block",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </Box>
      </Box>

      {/* Alpha slider */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ minWidth: 20, color: "#888" }}>A:</Box>
        <input
          type="range"
          min="0"
          max="100"
          value={Math.round(alpha * 100)}
          onChange={(e) => {
            const value = parseInt(e.target.value) / 100;
            handleAlphaChange(value);
          }}
          style={{ flex: 1 }}
        />
        <Box sx={{ minWidth: 30, fontSize: "0.8rem" }}>
          {Math.round(alpha * 100)}%
        </Box>
      </Box>
    </Box>
  );
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
          onChange={(e) => handleHexChange(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
        />
      </Box>

      {/* Tabs for switching between color wheel and sliders */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
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
