import type { Node } from "@graph/node";
import type { Context } from "./context";
import { getNode, type NodeType } from "./nodes/allNodes";
import type { NodeContext } from "./nodes/compilerNode";
import { GraphHelper } from "./graphHelper";
import type { Graph } from "@graph/graph";
import { CompileNodeContext } from "./compilerNodeContext";
import { parseFunctionsFrom, type FunctionDefinition } from "@glsl/function";

export interface CompilationOptions {
  noVariables?: boolean;
}

export class Compiler {
  constructor(graph: Graph, options?: CompilationOptions) {
    this.graph = new GraphHelper(graph);
    this.options = options ?? {};
    this.precompile(graph);
  }

  private precompile(graph: Graph): void {
    this.nameToFunction = parseFunctionsFrom(graph);
  }

  compile(nodeId: string): Context {
    const node = this.graph.getNodeById(nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found in graph`);
    }

    if (this.cachedContexts.has(node.identifier)) {
      return this.cachedContexts.get(node.identifier)!;
    }

    const compilerNode = getNode(node.nodeType as NodeType);
    const nodeContext = this.createNodeContextFor(node);

    const ctx = compilerNode.compile(nodeContext);
    this.cachedContexts.set(node.identifier, ctx);
    return ctx;
  }

  protected createNodeContextFor(node: Node): NodeContext {
    return new CompileNodeContext(this, this.options, this.graph, node);
  }

  protected nameToFunction: Record<string, FunctionDefinition> = {};
  protected graph: GraphHelper;
  protected cachedContexts: Map<string, Context> = new Map();
  protected options: CompilationOptions;
}
