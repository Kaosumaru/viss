import { Paper, Button } from "@mui/material";
import { ShaderCanvas } from "./shaderCanvas";
import { editorToGraph } from "./compileGraph";
import type { NodeEditor } from "rete";
import type { Schemes } from "./graph/node";

const vertexShader = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export interface PropertyViewProps {
  color: string;
  editor?: NodeEditor<Schemes>;
}

export function PropertyView({ color, editor }: PropertyViewProps) {
  const handleSaveGraph = async () => {
    if (!editor) {
      console.warn("No editor available");
      return;
    }

    try {
      const graph = editorToGraph(editor);
      const graphJson = JSON.stringify(graph, null, 2);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(graphJson);
      console.log("Graph saved to clipboard successfully");
    } catch (error) {
      console.error("Failed to save graph to clipboard:", error);
    }
  };
  const fragmentShader = `
precision mediump float;
uniform float u_time;
void main() {
  gl_FragColor = ${color}; 
}
`;

  return (
    <Paper elevation={3} style={{ padding: "1em", height: "100%" }}>
      <div style={{ marginBottom: "1em" }}>
        <Button 
          variant="contained" 
          onClick={handleSaveGraph}
          disabled={!editor}
          size="small"
        >
          Save Graph to Clipboard
        </Button>
      </div>
      <ShaderCanvas
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </Paper>
  );
}
