import type { ScalarTypeName } from "./typenames";
import type { Type } from "./types";

export function typeToName(type: Type): string {
  if (type.id === "any") {
    return "any";
  }
  return typeToGlsl(type);
}

export function typeToGlsl(type: Type): string {
  switch (type.id) {
    case "any":
      throw new Error("Cannot convert 'any' type to GLSL");
    case "scalar":
      return type.type;
    case "vector":
      return `${scalarToVectorPrefix(type.type)}${type.size}`;
    case "variant":
      return type.types.map(typeToGlsl).join(" | ");
  }
}

function scalarToVectorPrefix(scalar: ScalarTypeName): string {
  switch (scalar) {
    case "float":
      return "vec";
    case "int":
      return "ivec";
    case "bool":
      return "bvec";
    case "uint":
      return "uvec";
    case "double":
      return "dvec";
  }
}
