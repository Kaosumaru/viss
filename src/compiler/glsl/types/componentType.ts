import { scalar, type Type } from "./types";

export function componentType(type: Type): Type {
  switch (type.id) {
    case "scalar":
      return type;
    case "vector":
      return scalar(type.type);
    case "variant":
      throw new Error("Cannot get component type of variant");
    case "matrix":
      return type.double ? scalar("double") : scalar("float");
  }
}
