import type { ScalarTypeName } from "./typenames";
import type { Type } from "./types";

export function typeToName(type: Type): string {
  return typeToGlsl(type);
}

export function typeToGlsl(type: Type): string {
  switch (type.id) {
    case "scalar":
      return type.type;
    case "vector":
      return `${scalarToVectorPrefix(type.type)}${type.size}`;
    case "variant":
      return type.types.map(typeToGlsl).join(" | ");
    case "matrix":
      if (type.rows == type.columns) {
        return `${type.double ? "d" : ""}mat${type.rows}`;
      }
      return `${type.double ? "d" : ""}mat${type.rows}x${type.columns}`;
    case "sampler2D":
      return "sampler2D";
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
  }
}
