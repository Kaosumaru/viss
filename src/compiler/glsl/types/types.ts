import type { ScalarTypeName } from "./typenames";

export const genericFType = variantScalarVector("float");

export interface ScalarType {
  id: "scalar";
  type: ScalarTypeName;
}

export interface VectorType {
  id: "vector";
  type: ScalarTypeName;
  size: number;
}

export interface MatrixType {
  id: "matrix";
  double: boolean;
  rows: number;
  columns: number;
}

export interface VariantType {
  id: "variant";
  types: Type[];
}

export type Type = ScalarType | VectorType | MatrixType | VariantType;

export function scalar(type: ScalarTypeName): ScalarType {
  return {
    id: "scalar",
    type,
  };
}

export function vector(type: ScalarTypeName, size: number): VectorType {
  return {
    id: "vector",
    size,
    type,
  };
}

export function matrix(
  double: boolean,
  rows: number,
  columns: number
): MatrixType {
  return {
    id: "matrix",
    rows,
    columns,
    double,
  };
}

export function variant(types: Type[]): VariantType {
  return {
    id: "variant",
    types: flattenVariantTypes(types),
  };
}

export function variantScalarVector(type: ScalarTypeName): VariantType {
  return variant([scalar(type), variantVector(type)]);
}

export function variantVector(type: ScalarTypeName): VariantType {
  return variant([vector(type, 2), vector(type, 3), vector(type, 4)]);
}

export function variantMatrix(double: boolean): VariantType {
  return variant([
    matrix(double, 2, 2),
    matrix(double, 2, 3),
    matrix(double, 2, 4),
    matrix(double, 3, 2),
    matrix(double, 3, 3),
    matrix(double, 3, 4),
    matrix(double, 4, 2),
    matrix(double, 4, 3),
    matrix(double, 4, 4),
  ]);
}

function flattenVariantTypes(types: Type[]): Type[] {
  const result: Type[] = [];
  for (const type of types) {
    if (type.id === "variant") {
      result.push(...flattenVariantTypes(type.types));
    } else {
      result.push(type);
    }
  }
  return result;
}
