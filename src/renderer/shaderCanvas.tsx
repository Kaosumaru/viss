import React, { useEffect, useRef } from "react";

type ShaderCanvasProps = {
  vertexShader: string;
  fragmentShader: string;
};

export const ShaderCanvas: React.FC<ShaderCanvasProps> = ({
  vertexShader,
  fragmentShader,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const compileShader = (
      type: number,
      source: string
    ): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    console.log("Compiling shaders");
    console.log(fragmentShader);

    const vs = compileShader(gl.VERTEX_SHADER, vertexShader);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShader);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Setup fullscreen quad with positions and UVs
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Vertices: x, y, u, v (position + UV coordinates)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        // Triangle 1
        -1,
        -1,
        0,
        0, // Bottom-left
        1,
        -1,
        1,
        0, // Bottom-right
        -1,
        1,
        0,
        1, // Top-left
        // Triangle 2
        -1,
        1,
        0,
        1, // Top-left
        1,
        -1,
        1,
        0, // Bottom-right
        1,
        1,
        1,
        1, // Top-right
      ]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const uvLocation = gl.getAttribLocation(program, "a_uv");

    const stride = 4 * 4; // 4 floats per vertex (x, y, u, v) * 4 bytes per float

    if (positionLocation !== -1) {
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);
    }

    if (uvLocation !== -1) {
      gl.enableVertexAttribArray(uvLocation);
      gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, stride, 2 * 4); // offset by 2 floats
    }

    const uTimeLocation = gl.getUniformLocation(program, "uTime");
    const uResolutionLocation = gl.getUniformLocation(program, "uResolution");

    const startTime = performance.now();

    const render = () => {
      const currentTime = performance.now();
      const elapsedSeconds = (currentTime - startTime) / 1000;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      if (uTimeLocation) {
        gl.uniform1f(uTimeLocation, elapsedSeconds);
      }
      if (uResolutionLocation) {
        gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (uTimeLocation) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(positionBuffer);
    };
  }, [vertexShader, fragmentShader]);

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={256}
      style={{ display: "block" }}
    />
  );
};
