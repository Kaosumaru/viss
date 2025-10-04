import { Paper, Button, Stack } from "@mui/material";
import { ShaderCanvas } from "./shaderCanvas";
import styled from "styled-components";
import { useContext } from "react";
import { EditorContext } from "./context/EditorContext";

const FloatingPaper = styled(Paper)`
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }
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
  onToggleFullscreen: () => void;
}

export function PropertyView({ fragmentShader: shader, onToggleFullscreen }: PropertyViewProps) {
  const editorData = useContext(EditorContext).editor;
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

  const handleClearGraph = async () => {
    if (!editorData) {
      console.warn("No editor available");
      return;
    }
    await editorData.clear();
  };

  return (
    <FloatingPaper elevation={6}>
      {!__VSCODE_EXTENSION__ && (
        <Stack
          direction="row"
          spacing={2}
          padding={1}
          sx={{
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              void handleSaveGraph();
            }}
            disabled={!editorData}
            size="small"
          >
            Save
          </Button>
          <Button
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              void handleLoadGraph();
            }}
            disabled={!editorData}
            size="small"
          >
            Load
          </Button>

          <Button
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              void handleClearGraph();
            }}
            disabled={!editorData}
            size="small"
          >
            Clear
          </Button>
        </Stack>
      )}
      <div
        onClick={onToggleFullscreen}
        style={{
          flex: 1,
          padding: "12px",
          paddingTop: __VSCODE_EXTENSION__ ? "12px" : "0px",
          cursor: "pointer",
        }}
      >
        <ShaderCanvas vertexShader={vertexShader} fragmentShader={shader} />
      </div>
    </FloatingPaper>
  );
}
