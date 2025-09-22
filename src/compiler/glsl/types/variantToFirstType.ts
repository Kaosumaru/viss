import type { Type } from "./types";

export function variantToFirstType(type: Type): Type {
  if (type.id === "variant") {
    const firstType = type.types[0];
    if (firstType === undefined) {
      throw new Error("Variant type has no types");
    }
    return firstType;
  }
  return type;
}
