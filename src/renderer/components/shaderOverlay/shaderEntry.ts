const g_vertexShaderSrc = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const g_fragmentShaderSrc = `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(0.1, 0.1, 0.0, 0.01); // Dark green with 10% alpha
  }
`;

export class ShaderEntry {
  constructor(fragmentShaderSrc?: string, vertexShaderSrc?: string) {
    this.fragmentShaderSrc = fragmentShaderSrc || g_fragmentShaderSrc;
    this.vertexShaderSrc = vertexShaderSrc || g_vertexShaderSrc;
  }

  render(gl: WebGLRenderingContext, time: number) {
    if (this.broken) {
      return;
    }

    if (!this.program) {
      this.program = this.createProgram(gl);
    }

    if (!this.program) {
      console.error("Failed to create shader program");
      this.broken = true;
      return;
    }

    gl.useProgram(this.program);

    const posAttrib = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

    const timeUniform = gl.getUniformLocation(this.program, "u_time");
    gl.uniform1f(timeUniform, time);
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

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader!);
    gl.attachShader(program, fragmentShader!);
    gl.linkProgram(program);
    return program;
  }

  setPosition(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  x: number = 0;
  y: number = 0;
  w: number = 0;
  h: number = 0;
  broken: boolean = false;
  program: WebGLProgram | null = null;
  fragmentShaderSrc: string;
  vertexShaderSrc: string;
}
