import type { ScalarTypeName } from "./typenames";

export interface AnyType {
  id: "any";
}

export const Any: AnyType = {
  id: "any",
};

export interface ScalarType {
  id: "scalar";
  type: ScalarTypeName;
}

export interface VectorType {
  id: "vector";
  type: ScalarTypeName;
  size: number;
}

export type Type = AnyType | ScalarType | VectorType;

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
