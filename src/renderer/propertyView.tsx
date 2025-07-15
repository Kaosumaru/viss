import { Paper } from "@mui/material";
import { ShaderCanvas } from "./shaderCanvas";

const vertexShader = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export interface PropertyViewProps {
  color: string;
}

export function PropertyView({ color }: PropertyViewProps) {
  const fragmentShader = `
precision mediump float;
uniform float u_time;
void main() {
  gl_FragColor = ${color}; 
}
`;

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
