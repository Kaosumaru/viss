import type { ScalarType, VectorType } from "@glsl/types/types";
import type { ParameterValue } from "@graph/parameter";
import type { Uniform } from "@graph/uniform";
import type { ShaderRenderer } from "./shaderRenderer";

export type UniformsEntries = Record<string, UniformEntry>;

export interface UniformEntry {
  name: string;
  value: VectorValue | TextureValue;
}

export interface VectorValue {
  id: "vector";
  type: "f" | "i";
  size: number;
  value: number[];
}

export interface TextureValue {
  id: "texture";
  type: "2d" | "cube";
  path: string;
}

export function applyUniforms(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  uniforms: Record<string, UniformEntry>,
  shaderRenderer: ShaderRenderer
): void {
  for (const [name, entry] of Object.entries(uniforms)) {
    const location = gl.getUniformLocation(program, name);
    if (!location) continue;

    if (entry.value.id === "vector") {
      const { type, size, value } = entry.value;
      if (type === "f") {
        switch (size) {
          case 1:
            gl.uniform1fv(location, value);
            break;
          case 2:
            gl.uniform2fv(location, value);
            break;
          case 3:
            gl.uniform3fv(location, value);
            break;
          case 4:
            gl.uniform4fv(location, value);
            break;
        }
      } else {
        switch (size) {
          case 1:
            gl.uniform1iv(location, value);
            break;
          case 2:
            gl.uniform2iv(location, value);
            break;
          case 3:
            gl.uniform3iv(location, value);
            break;
          case 4:
            gl.uniform4iv(location, value);
            break;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (entry.value.id === "texture") {
      const { type, path } = entry.value;
      if (type === "2d") {
        const id = shaderRenderer.textureHelper.getTextureId(path);
        gl.uniform1i(location, id);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (type === "cube") {
        // TODO
      }
    }
  }
}

export function uniformEntryFromUniform(uniform: Uniform): UniformEntry {
  switch (uniform.type.id) {
    case "scalar": {
      // Handle scalar types (including bool)
      if (uniform.type.type === "bool") {
        return uniformEntryFromBool(uniform.id, uniform.defaultValue);
      }
      return uniformEntryFromScalar(
        uniform.id,
        uniform.type,
        uniform.defaultValue
      );
    }
    case "vector":
      return uniformEntryFromVector(
        uniform.id,
        uniform.type,
        uniform.defaultValue
      );
    case "sampler2D":
      return uniformEntryFromTexture(uniform.id, uniform.defaultValue);
  }

  throw new Error("Unsupported uniform type");
}

function uniformEntryFromTexture(
  name: string,
  defaultValue?: ParameterValue
): UniformEntry {
  const value = defaultValue?.type === "string" ? defaultValue.value : "";

  return {
    name,
    value: {
      id: "texture",
      type: "2d",
      path: value,
    },
  };
}

function uniformEntryFromScalar(
  name: string,
  type: ScalarType,
  defaultValue?: ParameterValue
): UniformEntry {
  const value = defaultValue?.type === "number" ? defaultValue.value : 0;

  return {
    name,
    value: {
      id: "vector",
      type: type.type === "float" ? "f" : "i",
      size: 1,
      value: [value],
    },
  };
}

function uniformEntryFromBool(
  name: string,
  defaultValue?: ParameterValue
): UniformEntry {
  const value =
    defaultValue?.type === "boolean" ? (defaultValue.value ? 1 : 0) : 0;

  return {
    name,
    value: {
      id: "vector",
      type: "i", // booleans are represented as integers in shaders
      size: 1,
      value: [value],
    },
  };
}

function uniformEntryFromVector(
  name: string,
  type: VectorType,
  defaultValue?: ParameterValue
): UniformEntry {
  let value: number[];

  if (defaultValue?.type === "color" || defaultValue?.type === "vector") {
    value = defaultValue.value.slice(0, type.size);
    // Ensure we have enough values
    while (value.length < type.size) {
      value.push(0);
    }
  } else {
    // Create a default array of zeros with the right size
    value = Array(type.size).fill(0) as number[];
  }

  return {
    name,
    value: {
      id: "vector",
      type: type.type === "float" ? "f" : "i",
      size: type.size,
      value,
    },
  };
}
