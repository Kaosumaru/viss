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
  id: "scalar";
  type: ScalarTypeName;
  size: number;
}

export type Type = AnyType | ScalarType | VectorType;
