import type { Node } from "@graph/node";
import type { Context } from "./context";
import { Any } from "@glsl/types";
import { getNode, type NodeType } from "./nodes/allNodes";
import type { NodeContext } from "./nodes/compilerNode";
import type { ParameterValueType } from "@graph/parameter";
import { GraphHelper } from "./graphHelper";
import type { Graph } from "@graph/graph";

export class Compiler {
  constructor(graph: Graph) {
    this.graph = new GraphHelper(graph);
  }

  compile(nodeId: string): Context {
    const node = this.graph.getNodeById(nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found in graph`);
    }

    const ctx: Context = {
      type: Any,
      mainOutput: "",
    };

    const compilerNode = getNode(node.nodeType as NodeType);
    const nodeContext = this.createNodeContextFor(node);

    const compiledCtx = compilerNode.compile(ctx, nodeContext);

    return compiledCtx;
  }

  protected createNodeContextFor(node: Node): NodeContext {
    return {
      getInput: (name) => {
        const input = node.inputs[name];
        if (!input) {
          throw new Error(`Input ${name} not found in node ${node.identifier}`);
        }
        // TODO: Implement input handling
        throw new Error(`NYI`);
      },
      getParam: <T extends ParameterValueType>(name: string, type: T) => {
        const param = node.parameters[name];
        if (!param) {
          throw new Error(
            `Parameter ${name} not found in node ${node.identifier}`
          );
        }
        if (param.type !== type) {
          throw new Error(
            `Parameter ${name} expected type ${type}, but got ${param.type}`
          );
        }
        return param.value;
      },
    };
  }

  protected graph: GraphHelper;
}
