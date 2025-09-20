export function createBuffer(gl: WebGLRenderingContext) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Use unit quad (0,0 to 1,1) with UV coordinates
  // Vertices: x, y, u, v (position + UV coordinates)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // Triangle 1
      0,
      0,
      0,
      0, // Bottom-left
      1,
      0,
      1,
      0, // Bottom-right
      0,
      1,
      0,
      1, // Top-left
      // Triangle 2
      0,
      1,
      0,
      1, // Top-left
      1,
      0,
      1,
      0, // Bottom-right
      1,
      1,
      1,
      1, // Top-right
    ]),
    gl.STATIC_DRAW
  );
}
