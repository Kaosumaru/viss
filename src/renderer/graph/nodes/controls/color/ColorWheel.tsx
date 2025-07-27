import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { hsvToRgb, rgbToHsv } from "./utils";
import type { Color } from "@graph/parameter";

// Color wheel component
export function ColorWheel({
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
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [isDraggingSV, setIsDraggingSV] = useState(false);

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

  const handleHueInteraction = useCallback(
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

  const handleHueMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDraggingHue(true);
      handleHueInteraction(event);
    },
    [handleHueInteraction]
  );

  const handleHueMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDraggingHue) {
        handleHueInteraction(event);
      }
    },
    [isDraggingHue, handleHueInteraction]
  );

  const handleHueMouseUp = useCallback(() => {
    setIsDraggingHue(false);
  }, []);

  const handleSVInteraction = useCallback(
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

  const handleSVMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDraggingSV(true);
      handleSVInteraction(event);
    },
    [handleSVInteraction]
  );

  const handleSVMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDraggingSV) {
        handleSVInteraction(event);
      }
    },
    [isDraggingSV, handleSVInteraction]
  );

  const handleSVMouseUp = useCallback(() => {
    setIsDraggingSV(false);
  }, []);

  // Global mouse event handlers for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isDraggingHue && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const centerX = canvasRef.current.width / 2;
        const centerY = canvasRef.current.height / 2;
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
      }

      if (isDraggingSV && svAreaRef.current) {
        const rect = svAreaRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const newSaturation = Math.max(
          0,
          Math.min(1, x / svAreaRef.current.width)
        );
        const newValue = Math.max(
          0,
          Math.min(1, 1 - y / svAreaRef.current.height)
        );

        setSaturation(newSaturation);
        setValue(newValue);

        const [r, g, b] = hsvToRgb(hue, newSaturation, newValue);
        onChange([r, g, b, alpha]);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDraggingHue(false);
      setIsDraggingSV(false);
    };

    if (isDraggingHue || isDraggingSV) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDraggingHue, isDraggingSV, hue, saturation, value, alpha, onChange]);

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
            onMouseDown={handleHueMouseDown}
            onMouseMove={handleHueMouseMove}
            onMouseUp={handleHueMouseUp}
            onClick={handleHueInteraction}
            style={{ cursor: "pointer", display: "block" }}
          />
        </Box>

        {/* Saturation-Value area */}
        <Box sx={{ position: "relative" }}>
          <canvas
            ref={svAreaRef}
            width={120}
            height={120}
            onMouseDown={handleSVMouseDown}
            onMouseMove={handleSVMouseMove}
            onMouseUp={handleSVMouseUp}
            onClick={handleSVInteraction}
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
