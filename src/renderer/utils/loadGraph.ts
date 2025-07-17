import type { NodeType } from "@compiler/nodes/allNodes";
import type { Graph } from "@graph/graph";
import type { AreaExtra, Schemes } from "../graph/node";
import { UICompilerNode } from "../graph/nodes/compilerNode";
import { ClassicPreset, type NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";

export async function loadGraph(
  graphJson: string,
  editor: NodeEditor<Schemes>,
  area?: AreaPlugin<Schemes, AreaExtra>
) {
  const graph: Graph = JSON.parse(graphJson);

  // Clear current nodes
  const currentNodes = editor.getNodes();
  for (const node of currentNodes) {
    await editor.removeNode(node.id);
  }

  const currentConnections = editor.getConnections();
  for (const connection of currentConnections) {
    await editor.removeConnection(connection.id);
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

      if (uiNode.inputs[key]?.control) {
        const control = uiNode.inputs[key]
          .control as ClassicPreset.InputControl<"number">;
        if (param.type === "number") {
          control.setValue(param.value);
        }
      }
    });

    await editor.addNode(uiNode);

    // Set the node position from the saved graph
    if (area) {
      await area.translate(uiNode.id, graphNode.position);
    }
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
