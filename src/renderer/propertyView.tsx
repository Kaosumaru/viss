import { Paper, Button } from "@mui/material";
import { ShaderCanvas } from "./shaderCanvas";
import type { EditorAPI } from "./graph/interface";

const vertexShader = `
attribute vec2 a_position;
attribute vec2 a_uv;
varying vec2 v_uv;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_uv = a_uv;
}
`;

export interface PropertyViewProps {
  fragmentShader: string;
  editorData?: EditorAPI;
}

export function PropertyView({
  fragmentShader: shader,
  editorData,
}: PropertyViewProps) {
  const handleSaveGraph = async () => {
    if (!editorData) {
      console.warn("No editor available");
      return;
    }

    try {
      const graph = editorData.saveGraph();
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
      await editorData.loadGraphJSON(graphJson);

      console.log("Graph loaded successfully from clipboard");
    } catch (error) {
      console.error("Failed to load graph from clipboard:", error);
    }
  };

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
      <ShaderCanvas vertexShader={vertexShader} fragmentShader={shader} />
    </Paper>
  );
}
