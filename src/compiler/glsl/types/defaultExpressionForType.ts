import type { Expression } from "@compiler/context";
import {
  scalar,
  type MatrixType,
  type ScalarType,
  type Type,
  type VariantType,
  type VectorType,
} from "./types";
import { typeToGlsl } from "./typeToString";

export function defaultExpressionForType(type: Type): Expression {
  switch (type.id) {
    case "scalar":
      return defaultExpressionForScalar(type);
    case "vector":
      return defaultExpressionForVector(type);
    case "variant":
      return defaultExpressionForVariant(type);
    case "matrix":
      return defaultExpressionForMatrix(type);
    case "sampler2D":
      throw new Error("Cannot create default expression for sampler2D");
  }
}

function defaultExpressionForScalar(type: ScalarType): Expression {
  switch (type.type) {
    case "float":
      return { data: "0.0", type, trivial: true };
    case "int":
      return { data: "0", type, trivial: true };
    case "bool":
      return { data: "false", type, trivial: true };
    case "uint":
      return { data: "0u", type, trivial: true };
  }
}

function defaultExpressionForVector(vec: VectorType): Expression {
  const defaultValue = Array(vec.size).fill(
    defaultExpressionForScalar(scalar(vec.type)).data
  );
  const vectorName = typeToGlsl(vec);
  return {
    data: `${vectorName}(${defaultValue.join(", ")})`,
    type: vec,
    trivial: true,
  };
}

function defaultExpressionForVariant(variant: VariantType): Expression {
  if (variant.types.length === 0) {
    throw new Error("Cannot create default expression for empty variant type");
  }
  // Use the first type in the variant as the default
  const firstType = variant.types[0];
  return defaultExpressionForType(firstType);
}

function defaultExpressionForMatrix(matrix: MatrixType) {
  const value = defaultExpressionForScalar(scalar("float"));
  const defaultValue = Array(matrix.rows * matrix.columns).map(
    () => value.data
  );
  const matrixName = typeToGlsl(matrix);
  return {
    data: `${matrixName}(${defaultValue.join(", ")})`,
    type: matrix,
    trivial: true,
  };
}
