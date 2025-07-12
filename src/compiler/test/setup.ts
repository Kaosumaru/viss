import { Compiler } from "@compiler/compiler";
import type { Context } from "@compiler/context";
import type { NodeType } from "@compiler/nodes/allNodes";
import type { Graph } from "@graph/graph";
import type { Node } from "@graph/node";
import type { Parameters } from "@graph/parameter";

export interface TestNodeDescriptor {
  type: NodeType;
  params?: Parameters;
}

interface Descriptors {
  [key: string]: TestNodeDescriptor;
}

interface Connector<KeyTypes extends string> {
  graph: Graph;
  connect(
    inputNode: KeyTypes,
    input: string,
    outputNode: KeyTypes,
    output?: string
  ): Connector<KeyTypes>;
  compile(node: KeyTypes): Context;
}

export function setup<T extends Descriptors>(
  desc: T
): Connector<Extract<keyof T, string>> {
  return {
    graph: {
      nodes: Object.entries(desc).reduce((acc, [key, value]) => {
        acc.push({
          identifier: key,
          label: key,
          position: { x: 0, y: 0 }, // Default position
          parameters: value.params || {},
          inputs: {}, // No inputs for test nodes
          outputs: {}, // No outputs for test nodes
        });
        return acc;
      }, [] as Node[]),
      connections: [],
    },
    connect(inputNode, input, outputNode, output) {
      output = output || "out"; // Default output name
      this.graph.connections.push({
        from: {
          nodeId: inputNode,
          socketId: input,
        },
        to: {
          nodeId: outputNode,
          socketId: output,
        },
      });
      return this;
    },
    compile(node) {
      const compiler = new Compiler(this.graph);
      return compiler.compile(node);
    },
  };
}

setup({
  exampleNode: {
    type: "vector2",
  },
  anotherNode: {
    type: "vector3",
  },
}).connect("exampleNode", "input1", "anotherNode");
