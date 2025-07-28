export type ScalarTypeName = "bool" | "int" | "uint" | "float" | "double";

export type VectorTypeName =
  | "bvec2"
  | "bvec3"
  | "bvec4"
  | "ivec2"
  | "ivec3"
  | "ivec4"
  | "uvec2"
  | "uvec3"
  | "uvec4"
  | "vec2"
  | "vec3"
  | "vec4"
  | "dvec2"
  | "dvec3"
  | "dvec4";

export type MatrixTypeName =
  | "mat2"
  | "mat3"
  | "mat4"
  | "mat2x2"
  | "mat2x3"
  | "mat2x4"
  | "mat3x2"
  | "mat3x3"
  | "mat3x4"
  | "mat4x2"
  | "mat4x3"
  | "mat4x4";

export type TypeName =
  | ScalarTypeName
  | VectorTypeName
  | MatrixTypeName
  | "sampler2D"
  | "samplerCube";
