import type { Context } from "@compiler/context";
import type { Node } from "@graph/node";
import type { ClassicPreset, NodeEditor } from "rete";
import type { Schemes } from "./graph/node";
import { UICompilerNode } from "./graph/nodes/compilerNode";
import type { Graph } from "@graph/graph";
import { Compiler } from "@compiler/compiler";

export function editorToGraph(editor: NodeEditor<Schemes>): Graph {
  const graph: Graph = {
    nodes: [],
    connections: [],
  };

  editor.getNodes().forEach((node) => {
    if (node instanceof UICompilerNode) {
      const gnode: Node = {
        identifier: node.id,
        nodeType: node.nodeType,
        position: { x: 0, y: 0 },
        inputs: {},
        outputs: {},
        parameters: {},
      };
      Object.entries(node.controls).forEach(([key, input]) => {
        const control = input as ClassicPreset.InputControl<"number" | "text">;
        if (control.type === "number") {
          gnode.parameters[key] = {
            type: "number",
            value: control.value ? Number(control.value) : 0,
          };
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

export function compileGraph(editor: NodeEditor<Schemes>): Context | undefined {
  const graph = editorToGraph(editor);
  try {
    const compiler = new Compiler(graph);
    const node = graph.nodes.find((n) => n.nodeType === "preview");
    if (!node) {
      throw new Error("Preview node not found in graph");
    }
    return compiler.compile(node.identifier);
  } catch (error) {
    console.error("Compilation error:", error);
    return undefined;
  }
}
