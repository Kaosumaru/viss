import type { NodeType } from "@compiler/nodes/allNodes";
import type { Graph } from "@graph/graph";
import { ClassicPreset } from "rete";
import type { EditorData } from "renderer/editorView";

export async function loadGraph(graphJson: string, editorData: EditorData) {
  const graph: Graph = JSON.parse(graphJson);
  editorData.clear();

  // Add nodes from graph
  for (const graphNode of graph.nodes) {
    const uiNode = await editorData.createNode(
      graphNode.nodeType as NodeType,
      graphNode.position.x,
      graphNode.position.y,
      graphNode.identifier
    );

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

      if (uiNode.inputs[key]?.control) {
        const control = uiNode.inputs[key]
          .control as ClassicPreset.InputControl<"number">;
        if (param.type === "number") {
          control.setValue(param.value);
        }
      }
    });
  }

  // Add connections
  for (const connection of graph.connections) {
    const sourceNode = editorData.editor.getNode(connection.from.nodeId);
    const targetNode = editorData.editor.getNode(connection.to.nodeId);

    if (sourceNode && targetNode) {
      await editorData.editor.addConnection(
        new ClassicPreset.Connection(
          sourceNode,
          connection.from.socketId,
          targetNode,
          connection.to.socketId
        )
      );
    }
  }
}
