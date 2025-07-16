import { Paper, Button } from "@mui/material";
import { ShaderCanvas } from "./shaderCanvas";
import { editorToGraph } from "./compileGraph";
import type { NodeEditor } from "rete";
import type { Schemes, AreaExtra } from "./graph/node";
import { UICompilerNode } from "./graph/nodes/compilerNode";
import type { Graph } from "@graph/graph";
import type { NodeType } from "@compiler/nodes/allNodes";
import { ClassicPreset } from "rete";
import type { AreaPlugin } from "rete-area-plugin";

const vertexShader = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export interface PropertyViewProps {
  color: string;
  editor?: NodeEditor<Schemes>;
  area?: AreaPlugin<Schemes, AreaExtra>;
}

export function PropertyView({ color, editor, area }: PropertyViewProps) {
  const handleSaveGraph = async () => {
    if (!editor) {
      console.warn("No editor available");
      return;
    }

    try {
      const graph = editorToGraph(editor, area);
      const graphJson = JSON.stringify(graph, null, 2);

      // Copy to clipboard
      await navigator.clipboard.writeText(graphJson);
      console.log("Graph saved to clipboard successfully");
    } catch (error) {
      console.error("Failed to save graph to clipboard:", error);
    }
  };

  const handleLoadGraph = async () => {
    if (!editor) {
      console.warn("No editor available");
      return;
    }

    try {
      // Read from clipboard
      const graphJson = await navigator.clipboard.readText();
      const graph: Graph = JSON.parse(graphJson);

      // Clear current nodes
      const currentNodes = editor.getNodes();
      for (const node of currentNodes) {
        await editor.removeNode(node.id);
      }

      // Add nodes from graph
      for (const graphNode of graph.nodes) {
        const uiNode = new UICompilerNode(graphNode.nodeType as NodeType);

        // Set the node ID to preserve original IDs
        uiNode.id = graphNode.identifier;

        // Set parameters
        Object.entries(graphNode.parameters).forEach(([key, param]) => {
          const control = uiNode.controls[
            key
          ] as ClassicPreset.InputControl<"number">;
          if (control && param.type === "number") {
            control.setValue(param.value);
          }
        });

        await editor.addNode(uiNode);
      }

      // Add connections
      for (const connection of graph.connections) {
        const sourceNode = editor.getNode(connection.from.nodeId);
        const targetNode = editor.getNode(connection.to.nodeId);

        if (sourceNode && targetNode) {
          await editor.addConnection(
            new ClassicPreset.Connection(
              sourceNode,
              connection.from.socketId,
              targetNode,
              connection.to.socketId
            )
          );
        }
      }

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
          disabled={!editor}
          size="small"
        >
          Save Graph to Clipboard
        </Button>
        <Button
          variant="outlined"
          onClick={handleLoadGraph}
          disabled={!editor}
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
