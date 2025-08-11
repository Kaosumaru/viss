import { Paper, Button } from "@mui/material";
import { ShaderCanvas } from "./shaderCanvas";
import type { EditorAPI } from "./graph/interface";
import styled from "styled-components";

const FloatingPaper = styled(Paper)`
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
`;

const vertexShader = `
attribute vec2 a_position;
attribute vec2 a_uv;
varying vec2 vUv;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  vUv = a_uv;
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
    <FloatingPaper elevation={6}>
      {!__VSCODE_EXTENSION__ && (
        <div
          style={{
            padding: "12px",
            paddingBottom: "8px",
            display: "flex",
            gap: "0.5em",
            flexShrink: 0,
          }}
        >
          <Button
            variant="contained"
            onClick={handleSaveGraph}
            disabled={!editorData}
            size="small"
          >
            Save Graph
          </Button>
          <Button
            variant="outlined"
            onClick={handleLoadGraph}
            disabled={!editorData}
            size="small"
          >
            Load Graph
          </Button>
        </div>
      )}
      <div
        style={{
          flex: 1,
          padding: "12px",
          paddingTop: __VSCODE_EXTENSION__ ? "12px" : "0px",
        }}
      >
        <ShaderCanvas vertexShader={vertexShader} fragmentShader={shader} />
      </div>
    </FloatingPaper>
  );
}
