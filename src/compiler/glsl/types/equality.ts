import type { Type } from "./types";
import { assertSameTypes } from "./utils";

export function areTypesEqual(type1: Type, type2: Type): boolean {
  if (type1.id !== type2.id) {
    return false;
  }

  assertSameTypes(type1, type2);

  switch (type1.id) {
    case "scalar":
      assertSameTypes(type1, type2);
      return type1.type === type2.type;
    case "vector":
      assertSameTypes(type1, type2);
      return type1.type === type2.type && type1.size === type2.size;
    case "variant":
      assertSameTypes(type1, type2);
      return areVariantsEqual(type1.types, type2.types);
    case "matrix":
      assertSameTypes(type1, type2);
      return (
        type1.rows === type2.rows &&
        type1.columns === type2.columns &&
        type1.double === type2.double
      );
  }
}

function areVariantsEqual(types1: Type[], types2: Type[]): boolean {
  if (types1.length !== types2.length) {
    return false;
  }

  for (const type of types1) {
    let foundEqualType = false;
    for (const otherType of types2) {
      if (areTypesEqual(type, otherType)) {
        foundEqualType = true;
        break;
      }
    }
    if (!foundEqualType) {
      return false;
    }
  }

  return true;
}
