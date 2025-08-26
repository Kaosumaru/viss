import type { ShaderRenderer } from "./shaderRenderer";
import {
  applyUniforms,
  type UniformEntry,
  type UniformsEntries,
} from "./uniform";

const g_vertexShaderSrc = `
  precision mediump float;
  attribute vec2 a_position;
  attribute vec2 a_uv;
  uniform vec2 u_canvasResolution;
  uniform vec2 uResolution;
  uniform vec4 u_rect; // x, y, width, height in pixels
  varying vec2 vUv;

  void main() {
    // Transform from pixel coordinates to NDC
    vec2 pixelPos = a_position * u_rect.zw + u_rect.xy;
    vec2 clipSpace = ((pixelPos / u_canvasResolution) * 2.0) - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0.0, 1.0);
    vUv = a_uv;
  }
`;

const g_fragmentShaderSrc = `
  precision mediump float;
  uniform vec2 uResolution;
  uniform vec4 u_rect; // x, y, width, height in pixels
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Dark green with 10% alpha
  }
`;

export class ShaderEntry {
  setShader(fragment: string | undefined) {
    this.fragmentShaderSrc = fragment ?? g_fragmentShaderSrc;
    this.broken = false; // Reset broken state
    this.program = null; // Reset program to recompile with new shader
  }

  updateUniforms(uniforms: UniformsEntries) {
    this.uniforms = uniforms;
    if (this.program) {
      this.uniformsToUpdate = this.uniforms;
    }
  }

  updateUniform(uniform: UniformEntry) {
    this.uniforms[uniform.name] = uniform;
    if (this.program) {
      this.uniformsToUpdate = {
        ...this.uniformsToUpdate,
        [uniform.name]: uniform,
      };
    }
  }

  constructor(renderer: ShaderRenderer, fragmentShaderSrc?: string, vertexShaderSrc?: string) {
    this.renderer = renderer;
    this.fragmentShaderSrc = fragmentShaderSrc || g_fragmentShaderSrc;
    this.vertexShaderSrc = vertexShaderSrc || g_vertexShaderSrc;
  }

  render(
    gl: WebGLRenderingContext,
    time: number,
    canvasWidth: number,
    canvasHeight: number
  ) {
    if (this.broken) {
      return;
    }

    if (!this.program) {
      this.program = this.createProgram(gl);
      if (this.program) {
        this.uniformsToUpdate = this.uniforms;
      }
    }

    if (!this.program) {
      console.error("Failed to create shader program");
      this.broken = true;
      return;
    }

    if (this.uniformsToUpdate) {
      applyUniforms(gl, this.program, this.uniformsToUpdate, this.renderer);
      this.uniformsToUpdate = undefined;
    }

    gl.useProgram(this.program);

    const posAttrib = gl.getAttribLocation(this.program, "a_position");
    const uvAttrib = gl.getAttribLocation(this.program, "a_uv");

    const stride = 4 * 4; // 4 floats per vertex (x, y, u, v) * 4 bytes per float

    if (posAttrib !== -1) {
      gl.enableVertexAttribArray(posAttrib);
      gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, stride, 0);
    }

    if (uvAttrib !== -1) {
      gl.enableVertexAttribArray(uvAttrib);
      gl.vertexAttribPointer(uvAttrib, 2, gl.FLOAT, false, stride, 2 * 4); // offset by 2 floats
    }

    // Set uniforms
    const timeUniform = gl.getUniformLocation(this.program, "uTime");
    const resolutionUniform = gl.getUniformLocation(
      this.program,
      "uResolution"
    );
    const canvasResolutionUniform = gl.getUniformLocation(
      this.program,
      "u_canvasResolution"
    );
    const rectUniform = gl.getUniformLocation(this.program, "u_rect");

    if (timeUniform) {
      gl.uniform1f(timeUniform, time);
    }
    if (resolutionUniform) {
      gl.uniform2f(resolutionUniform, this.w, this.h);
    }
    if (canvasResolutionUniform) {
      gl.uniform2f(canvasResolutionUniform, canvasWidth, canvasHeight);
    }
    if (rectUniform) {
      gl.uniform4f(rectUniform, this.x, this.y, this.w, this.h);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
    // Compile shader
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, this.vertexShaderSrc);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, this.fragmentShaderSrc);

    const program = gl.createProgram();
    if (!program || !vertexShader || !fragmentShader) {
      console.error("Failed to create shader program", this.fragmentShaderSrc);
      return null;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  }

  setPosition(x: number, y: number, w: number, h: number): ShaderEntry {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    return this;
  }

  x: number = 0;
  y: number = 0;
  w: number = 0;
  h: number = 0;
  broken: boolean = false;
  program: WebGLProgram | null = null;
  fragmentShaderSrc: string;
  vertexShaderSrc: string;
  uniforms: UniformsEntries = {};
  uniformsToUpdate: UniformsEntries | undefined;
  renderer: ShaderRenderer;
}
