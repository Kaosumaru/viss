import type { Type } from "./types";

export function areTypesEqual(type1: Type, type2: Type): boolean {
  if (type1.id !== type2.id) {
    return false;
  }

  assertSameTypes(type1, type2);

  switch (type1.id) {
    case "any":
      return true;
    case "scalar":
      assertSameTypes(type1, type2);
      return type1.type === type2.type;
    case "vector":
      assertSameTypes(type1, type2);
      return (
        type1.type === type2.type && type1.size === type2.size
      );
  }
}

function assertSameTypes<T extends Type>(type1: T, type2: Type): asserts type2 is T {
  if (type1.id !== type2.id) {
    throw new Error(`Expected type ${type1.id}, but got ${type2.id}`);
  }
}