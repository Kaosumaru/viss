import type { Color } from "@graph/parameter";

// Helper function to convert RGBA to HEX with alpha
export function rgbaToHex(color: Color): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(color[0])}${toHex(color[1])}${toHex(color[2])}${toHex(
    color[3]
  )}`;
}

// Helper function to convert HEX (with optional alpha) to RGBA
export function hexToRgba(hex: string): Color {
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
export function hsvToRgb(
  h: number,
  s: number,
  v: number
): [number, number, number] {
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
export function rgbToHsv(
  r: number,
  g: number,
  b: number
): [number, number, number] {
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

export function colorToCSS(color: Color): string {
  return `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${
    color[3]
  })`;
}
