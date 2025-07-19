import { Paper, Button } from "@mui/material";
import { ShaderCanvas } from "./shaderCanvas";
import { loadGraph } from "./utils/loadGraph";
import { editorToGraph } from "./utils/saveGraph";
import type { EditorData } from "./editorView";

const vertexShader = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export interface PropertyViewProps {
  color: string;
  editorData?: EditorData;
}

export function PropertyView({ color, editorData }: PropertyViewProps) {
  const handleSaveGraph = async () => {
    if (!editorData?.editor) {
      console.warn("No editor available");
      return;
    }

    try {
      const graph = editorToGraph(editorData);
      const graphJson = JSON.stringify(graph, null, 2);

      // Copy to clipboard
      await navigator.clipboard.writeText(graphJson);
      console.log("Graph saved to clipboard successfully");
    } catch (error) {
      console.error("Failed to save graph to clipboard:", error);
    }
  };

  const handleLoadGraph = async () => {
    if (!editorData) {
      console.warn("No editor available");
      return;
    }

    try {
      // Read from clipboard
      const graphJson = await navigator.clipboard.readText();
      await loadGraph(graphJson, editorData);

      console.log("Graph loaded successfully from clipboard");
    } catch (error) {
      console.error("Failed to load graph from clipboard:", error);
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
      <div style={{ marginBottom: "1em", display: "flex", gap: "0.5em" }}>
        <Button
          variant="contained"
          onClick={handleSaveGraph}
          disabled={!editorData}
          size="small"
        >
          Save Graph to Clipboard
        </Button>
        <Button
          variant="outlined"
          onClick={handleLoadGraph}
          disabled={!editorData}
          size="small"
        >
          Load Graph from Clipboard
        </Button>
      </div>
      <ShaderCanvas
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </Paper>
  );
}
