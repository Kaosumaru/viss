import { Paper } from "@mui/material";
import { ShaderCanvas } from "./shaderCanvas";

const vertexShader = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision mediump float;
void main() {
  gl_FragColor = vec4(gl_FragCoord.x/500.0, gl_FragCoord.y/500.0, 0.5, 1.0);
}
`;

export function PropertyView() {
  return (
    <Paper elevation={3} style={{ padding: "1em", height: "100%" }}>
      <h2>Properties</h2>
      <p>Select a node to view its properties.</p>
      <ShaderCanvas
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </Paper>
  );
}
