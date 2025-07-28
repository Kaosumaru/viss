import type { Type, VectorType } from "./types";
import { assertSameTypes } from "./utils";
import type { ScalarTypeName } from "./typenames";

export function canBeImplicitlyConverter(from: Type, to: Type): boolean {
  if (from.id !== to.id) {
    return false;
  }

  switch (from.id) {
    case "any":
      return true;
    case "scalar":
      assertSameTypes(from, to);
      return canScalarBeImplicitlyConverted(from.type, to.type);
    case "vector":
      assertSameTypes(from, to);
      return canVectorBeImplicitlyConverted(from, to);
  }
  return false;
}

function canScalarBeImplicitlyConverted(
  from: ScalarTypeName,
  to: ScalarTypeName
): boolean {
  switch (from) {
    case "int":
      return to === "int" || to === "uint" || to === "float" || to === "double";
    case "uint":
      return to === "uint" || to === "float" || to === "double";
    case "float":
      return to === "float" || to === "double";
    case "double":
      return to === "double";
    case "bool":
      return to === "bool";
  }
  return false;
}

function canVectorBeImplicitlyConverted(
  from: VectorType,
  to: VectorType
): boolean {
  if (from.size !== to.size) {
    return false;
  }

  return canScalarBeImplicitlyConverted(from.type, to.type);
}
