export const allScalarTypeNames = ["bool", "int", "uint", "float"] as const;

export type ScalarTypeName = (typeof allScalarTypeNames)[number];

export const allVectorTypeNames = [
  "bvec2",
  "bvec3",
  "bvec4",
  "ivec2",
  "ivec3",
  "ivec4",
  "uvec2",
  "uvec3",
  "uvec4",
  "vec2",
  "vec3",
  "vec4",
];

export type VectorTypeName = (typeof allVectorTypeNames)[number];

export const allMatrixTypeNames = [
  "mat2",
  "mat3",
  "mat4",
  "mat2x2",
  "mat2x3",
  "mat2x4",
  "mat3x2",
  "mat3x3",
  "mat3x4",
  "mat4x2",
  "mat4x3",
  "mat4x4",
];

export type MatrixTypeName = (typeof allMatrixTypeNames)[number];

export const allTypeNames = [
  ...allScalarTypeNames,
  ...allVectorTypeNames,
  ...allMatrixTypeNames,
];

export type TypeName =
  | ScalarTypeName
  | VectorTypeName
  | MatrixTypeName
  | "sampler2D"
  | "samplerCube";
