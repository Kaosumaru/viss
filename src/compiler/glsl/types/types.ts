import type { ScalarTypeName } from "./typenames";

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

export interface Sampler2DType {
  id: "sampler2D";
}

export interface ErrorType {
  id: "error";
}

export type Type =
  | ScalarType
  | VectorType
  | MatrixType
  | VariantType
  | Sampler2DType
  | ErrorType; // used for undefined sockets, etc.

const _cachedScalars = createScalarCache();
const _cachedMatrix = createMatrixCache();

const _sampler2D: Sampler2DType = {
  id: "sampler2D",
};

export function sampler2D(): Sampler2DType {
  return _sampler2D;
}

export function scalar(type: ScalarTypeName): ScalarType {
  return _cachedScalars[type].scalar;
}

export const genericFType = variantScalarVector("float");

export function vector(type: ScalarTypeName, size: number): VectorType {
  if (size < 2 || size > 4) {
    throw new Error(`Invalid vector size: ${size}`);
  }
  return _cachedScalars[type].vectors[size - 2];
}

export function matrix(
  double: boolean,
  rows: number,
  columns: number
): MatrixType {
  return _cachedMatrix[+double][rows - 2][columns - 2];
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

export function variantAllScalarsVectors(): VariantType {
  return variant([
    variantScalarVector("float"),
    variantScalarVector("int"),
    variantScalarVector("bool"),
    variantScalarVector("uint"),
  ]);
}

export function variantAllTypes(): VariantType {
  return variant([
    variantScalarVector("float"),
    variantScalarVector("int"),
    variantScalarVector("bool"),
    variantScalarVector("uint"),
    variantMatrix(false),
    variantMatrix(true),
  ]);
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
  return [...new Set(result)]; // Remove duplicates
}

// caches for intrinsics

interface CachedScalarType {
  scalar: ScalarType;
  vectors: VectorType[];
}

function createMatrixCache(): MatrixType[][][] {
  return Array.from({ length: 2 }, (_, double) =>
    Array.from({ length: 3 }, (_, rows) =>
      Array.from({ length: 3 }, (_, columns) => ({
        id: "matrix",
        double: !!double,
        rows: rows + 2,
        columns: columns + 2,
      }))
    )
  );
}

function _cachedType(type: ScalarTypeName): CachedScalarType {
  return {
    scalar: {
      id: "scalar",
      type,
    },
    vectors: Array.from({ length: 3 }, (_, i) => ({
      id: "vector",
      type,
      size: i + 2,
    })),
  };
}

function createScalarCache(): Record<ScalarTypeName, CachedScalarType> {
  return {
    float: _cachedType("float"),
    int: _cachedType("int"),
    bool: _cachedType("bool"),
    uint: _cachedType("uint"),
  };
}
