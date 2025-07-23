import type { NodeType } from "@compiler/nodes/allNodes";
import type { Graph } from "@graph/graph";
import { ClassicPreset, NodeEditor } from "rete";
import { BooleanControl } from "../nodes/controls/customBooleanControl";
import type { Schemes } from "../node";
import type { EditorAPI } from "../interface";

export async function loadGraph(
  graphJson: string,
  editorData: EditorAPI,
  editor: NodeEditor<Schemes>
) {
  const graph: Graph = JSON.parse(graphJson);

  // Add nodes from graph
  for (const graphNode of graph.nodes) {
    const uiNode = await editorData.createNode(
      graphNode.nodeType as NodeType,
      "absolute", // Use absolute positioning for loading
      graphNode.position.x,
      graphNode.position.y,
      graphNode.identifier
    );

    // Set the node ID to preserve original IDs
    uiNode.id = graphNode.identifier;

    // Set parameters
    Object.entries(graphNode.parameters).forEach(([key, param]) => {
      // Check for standalone controls
      const control = uiNode.controls[key];
      if (control instanceof BooleanControl && param.type === "boolean") {
        control.value = param.value as boolean;
      } else if (
        control instanceof ClassicPreset.InputControl &&
        param.type === "number"
      ) {
        control.setValue(param.value);
      }

      // Check for input controls
      if (uiNode.inputs[key]?.control) {
        const inputControl = uiNode.inputs[key].control;
        if (
          inputControl instanceof BooleanControl &&
          param.type === "boolean"
        ) {
          inputControl.value = param.value as boolean;
        } else if (
          inputControl instanceof ClassicPreset.InputControl &&
          param.type === "number"
        ) {
          inputControl.setValue(param.value);
        }
      }
    });
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
}
