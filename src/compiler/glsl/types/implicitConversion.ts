import type { Type, VariantType, VectorType } from "./types";
import { assertSameTypes } from "./utils";
import type { ScalarTypeName } from "./typenames";
import { areTypesEqual } from "./equality";

export function canBeImplicitlyConverted(from: Type, to: Type): boolean {
  if (to.id === "variant") {
    return canBeImplicitlyConvertedToVariant(from, to);
  }

  if (from.id !== to.id) {
    return false;
  }

  switch (from.id) {
    case "scalar":
      assertSameTypes(from, to);
      return canScalarBeImplicitlyConverted(from.type, to.type);
    case "vector":
      assertSameTypes(from, to);
      return canVectorBeImplicitlyConverted(from, to);
    case "matrix":
      assertSameTypes(from, to);
      return (
        from.rows === to.rows &&
        from.columns === to.columns &&
        (from.double === to.double || (!from.double && to.double))
      );
    case "sampler2D":
      return true;
  }
}

function canScalarBeImplicitlyConverted(
  from: ScalarTypeName,
  to: ScalarTypeName
): boolean {
  switch (from) {
    case "int":
      return to === "int" || to === "uint" || to === "float";
    case "uint":
      return to === "uint" || to === "float";
    case "float":
      return to === "float";
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

function canBeImplicitlyConvertedToVariant(
  from: Type,
  to: VariantType
): boolean {
  if (from.id === "variant") {
    return areTypesEqual(from, to);
  }

  for (const type of to.types) {
    if (canBeImplicitlyConverted(from, type)) {
      return true;
    }
  }

  return false;
}
