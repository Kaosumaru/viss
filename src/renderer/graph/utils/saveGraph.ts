import type { Node } from "@graph/node";
import type { ClassicPreset, NodeEditor } from "rete";
import { UICompilerNode } from "../nodes/compilerNode";
import { BooleanControl } from "../nodes/controls/customBooleanControl";
import type { Graph } from "@graph/graph";
import type { AreaExtra, Schemes } from "../node";
import type { AreaPlugin } from "rete-area-plugin";

export function saveGraph(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>
): Graph {
  const graph: Graph = {
    includes: [],
    nodes: [],
    connections: [],
  };

  editor.getNodes().forEach((node) => {
    if (node instanceof UICompilerNode) {
      // Get the actual position from the area plugin
      let position = { x: 0, y: 0 };
      if (area) {
        const nodeView = area.nodeViews.get(node.id);
        if (nodeView) {
          position = { x: nodeView.position.x, y: nodeView.position.y };
        }
      }

      const gnode: Node = {
        identifier: node.id,
        nodeType: node.nodeType,
        position: position,
        inputs: {},
        outputs: {},
        parameters: {},
      };

      Object.entries(node.controls).forEach(([key, input]) => {
        if (input) {
          addParameterFromControlToNode(gnode, key, input);
        }
      });

      Object.entries(node.inputs).forEach(([key, input]) => {
        if (input?.control) {
          addParameterFromControlToNode(gnode, key, input.control);
        }
      });

      graph.nodes.push(gnode);
    }
  });

  editor.getConnections().forEach((connection) => {
    graph.connections.push({
      from: {
        nodeId: connection.source,
        socketId: connection.sourceOutput,
      },
      to: {
        nodeId: connection.target,
        socketId: connection.targetInput,
      },
    });
  });
  return graph;
}

function addParameterFromControlToNode(
  gnode: Node,
  key: string,
  control: ClassicPreset.Control
) {
  if (control instanceof BooleanControl) {
    gnode.parameters[key] = {
      type: "boolean",
      value: control.value,
    };
  } else {
    const inputControl = control as ClassicPreset.InputControl<
      "number" | "text"
    >;
    if (inputControl?.type === "number") {
      gnode.parameters[key] = {
        type: "number",
        value: inputControl.value ? Number(inputControl.value) : 0,
      };
    }
  }
}
