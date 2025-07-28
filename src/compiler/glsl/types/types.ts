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

export interface VariantType {
  id: "variant";
  types: Set<Type>;
}

export type Type = AnyType | ScalarType | VectorType | VariantType;

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

export function variant(types: Type[]): VariantType {
  return {
    id: "variant",
    types: new Set(flattenVariantTypes(types)),
  };
}

function flattenVariantTypes(types: Type[]): Type[] {
  const result: Type[] = [];
  for (const type of types) {
    if (type.id === "variant") {
      result.push(...flattenVariantTypes(Array.from(type.types)));
    } else {
      result.push(type);
    }
  }
  return result;
}
