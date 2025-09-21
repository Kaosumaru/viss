import type { Type } from "@glsl/types/types";

// Function to get color based on socket type
export function getTypeColor(type?: Type): string {
  if (!type) return "#ffffff47"; // Default white/transparent

  switch (type.id) {
    case "error":
      return "#ff0000"; // Red for error types
    case "scalar":
      switch (type.type) {
        case "float":
          return "#4CAF50"; // Green for float
        case "int":
          return "#2196F3"; // Blue for int
        case "bool":
          return "#FF9800"; // Orange for bool
        default:
          return "#9C27B0"; // Purple for other scalars
      }
    case "vector":
      switch (type.size) {
        case 2:
          return "#F44336"; // Red for vec2
        case 3:
          return "#FFEB3B"; // Yellow for vec3
        case 4:
          return "#E91E63"; // Pink for vec4
        default:
          return "#795548"; // Brown for other vectors
      }
    default:
      return "#ffffff47"; // Default white/transparent
  }
}

export function getTypeBorderColor(type?: Type): string {
  if (!type) return "white";

  switch (type.id) {
    case "scalar":
      switch (type.type) {
        case "float":
          return "#2E7D32"; // Darker green for float
        case "int":
          return "#1565C0"; // Darker blue for int
        case "bool":
          return "#E65100"; // Darker orange for bool
        default:
          return "#6A1B9A"; // Darker purple for other scalars
      }
    case "vector":
      switch (type.size) {
        case 2:
          return "#C62828"; // Darker red for vec2
        case 3:
          return "#F57F17"; // Darker yellow for vec3
        case 4:
          return "#AD1457"; // Darker pink for vec4
        default:
          return "#5D4037"; // Darker brown for other vectors
      }
    default:
      return "white";
  }
}
