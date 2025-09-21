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
      return "float";
    case "sampler2D":
      throw new Error("Cannot get component type of sampler2D");
    case "error":
      throw new Error("Cannot get component type of error type");
  }
}
