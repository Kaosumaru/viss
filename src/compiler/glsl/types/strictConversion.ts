import type { Type, VariantType } from "./types";
import { areTypesEqual } from "./equality";

export function canBeStrictlyConverted(from: Type, to: Type): boolean {
  if (to.id === "variant") {
    return canBeStrictlyConvertedToVariant(from, to);
  }

  if (from.id !== to.id) {
    return false;
  }

  return areTypesEqual(from, to);
}

function canBeStrictlyConvertedToVariant(from: Type, to: VariantType): boolean {
  if (from.id === "variant") {
    return areTypesEqual(from, to);
  }

  for (const type of to.types) {
    if (canBeStrictlyConverted(from, type)) {
      return true;
    }
  }

  return false;
}
