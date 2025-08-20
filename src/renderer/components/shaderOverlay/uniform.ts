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
  value: WebGLTexture;
}

export function applyUniforms(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  uniforms: Record<string, UniformEntry>
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
      } else if (type === "i") {
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
    } else if (entry.value.id === "texture") {
      const { type, value } = entry.value;
      if (type === "2d") {
        gl.uniform1i(location, value as number); // Assuming texture unit is passed as a number
      } else if (type === "cube") {
        gl.uniform1i(location, value as number); // Assuming texture unit is passed as a number
      }
    }
  }
}
