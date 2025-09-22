import type { ScalarTypeName } from "@glsl/types/typenames";
import { scalar, variant, vector, type Type } from "@glsl/types/types";

export interface ConstraintInfo {
  underlyingScalar: ScalarTypeName[];
  constrainedType: ConstrainedType[];
}

export type ConstrainedType = ConstrainedScalar | ConstrainedVector;

export interface ConstrainedScalar {
  type: "scalar";
}

export interface ConstrainedVector {
  type: "vector";
  size?: number;
}

export function constrainedScalar(): ConstrainedScalar {
  return {
    type: "scalar",
  };
}

export function constrainedVector(size?: number): ConstrainedVector {
  return {
    type: "vector",
    size,
  };
}

export function constraintToType(constraint: ConstraintInfo): Type {
  const types: Type[] = [];

  for (const scalarType of constraint.underlyingScalar) {
    for (const type of constraint.constrainedType) {
      if (type.type === "scalar") {
        types.push(scalar(scalarType));
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (type.type === "vector") {
        if (type.size !== undefined) {
          types.push(vector(scalarType, type.size));
        } else {
          types.push(
            vector(scalarType, 2),
            vector(scalarType, 3),
            vector(scalarType, 4)
          );
        }
      }
    }
  }

  if (types.length === 0) {
    throw new Error("Constraint must have at least one type");
  }

  if (types.length === 1 && types[0] !== undefined) {
    return types[0];
  }

  return variant(types);
}

export function constraintToComponentType(constraint: ConstraintInfo): Type {
  const types: Type[] = [];

  for (const scalarType of constraint.underlyingScalar) {
    types.push(scalar(scalarType));
  }

  if (types.length === 0) {
    throw new Error("Constraint must have at least one type");
  }

  if (types.length === 1 && types[0] !== undefined) {
    return types[0];
  }

  return variant(types);
}

export function constrainScalarType(
  constraint: ConstraintInfo,
  type: ScalarTypeName
): ConstraintInfo {
  if (!constraint.underlyingScalar.includes(type)) {
    throw new Error(`Type ${type} is not a valid underlying scalar type`);
  }

  return {
    underlyingScalar: [type],
    constrainedType: constraint.constrainedType,
  };
}

export function constrainType(
  constraint: ConstraintInfo,
  type: Type
): ConstraintInfo {
  switch (type.id) {
    case "scalar":
      return {
        underlyingScalar: constraint.underlyingScalar,
        constrainedType: [
          {
            type: "scalar",
          },
        ],
      };
    case "vector":
      return {
        underlyingScalar: constraint.underlyingScalar,
        constrainedType: [
          {
            type: "vector",
            size: type.size,
          },
        ],
      };
  }

  throw new Error(`Type ${type.id} is not a valid constrained type`);
}

export function constraintInfo(
  underlyingScalar: ScalarTypeName[],
  constrainedType: ConstrainedType[]
): ConstraintInfo {
  return {
    underlyingScalar,
    constrainedType,
  };
}

export const genFType = constraintInfo(
  ["float"],
  [constrainedScalar(), constrainedVector()]
);
export const genFDType = constraintInfo(
  ["float"],
  [constrainedScalar(), constrainedVector()]
);
export const genFIDType = constraintInfo(
  ["float", "int"],
  [constrainedScalar(), constrainedVector()]
);
export const genFIDUType = constraintInfo(
  ["int", "float", "uint"],
  [constrainedScalar(), constrainedVector()]
);
