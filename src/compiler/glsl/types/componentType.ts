import type { ScalarTypeName } from "./typenames";
import { type Type } from "./types";

export function componentType(type: Type): ScalarTypeName {
  switch (type.id) {
    case "scalar":
    case "vector":
      return type.type;
    case "variant":
      throw new Error("Cannot get component type of variant");
    case "matrix":
      return type.double ? "double" : "float";
  }
}
