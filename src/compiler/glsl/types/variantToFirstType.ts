import type { Type } from "./types";

export function variantToFirstType(type: Type) {
  if (type.id === "variant") {
    return type.types[0];
  }
  return type;
}
