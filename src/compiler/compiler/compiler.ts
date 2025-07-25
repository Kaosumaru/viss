import type { Node } from "@graph/node";
import type { Context } from "./context";
import { getNode, type NodeType } from "./nodes/allNodes";
import type { NodeContext } from "./nodes/compilerNode";
import { GraphHelper } from "./graphHelper";
import type { Graph, GraphDiff } from "@graph/graph";
import { CompileNodeContext } from "./compilerNodeContext";
import { type FunctionDefinition } from "@glsl/function";
import type { Connection } from "@graph/connection";
import type { ParameterValue } from "@graph/parameter";

export interface CompilationOptions {
  noVariables?: boolean;
}

export class Compiler {
  constructor(options?: CompilationOptions) {
    this.graph = new GraphHelper();
    this.options = options ?? {};
  }

  public getCustomFunctions(): FunctionDefinition[] {
    return Object.values(this.nameToFunction);
  }

  compile(nodeId: string): Context {
    const node = this.graph.getNodeById(nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found in graph`);
    }

    const cacheContext = this.graph.getCachedContext(node.identifier);
    if (cacheContext) {
      return cacheContext;
    }

    const compilerNode = getNode(node.nodeType as NodeType);
    const nodeContext = this.createNodeContextFor(node);

    const ctx = compilerNode.compile(nodeContext);
    this.graph.cacheContext(node.identifier, ctx);
    return ctx;
  }

  public addNode(node: Omit<Node, "identifier">): GraphDiff {
    return this.graph.addNode(node);
  }

  public removeNode(nodeId: string): GraphDiff {
    return this.graph.removeNode(nodeId);
  }

  public addConnection(connection: Connection): GraphDiff {
    return this.graph.addConnection(connection);
  }

  public removeConnection(connection: Connection): GraphDiff {
    return this.graph.removeConnection(connection);
  }

  updateParameter(
    id: string,
    paramName: string,
    value: ParameterValue
  ): GraphDiff {
    return this.graph.updateParameter(id, paramName, value);
  }

  getGraph() {
    return this.graph.saveGraph();
  }

  loadGraph(graph: Graph) {
    return this.graph.loadGraph(graph);
  }

  protected createNodeContextFor(node: Node): NodeContext {
    return new CompileNodeContext(this, this.options, this.graph, node);
  }

  protected nameToFunction: Record<string, FunctionDefinition> = {};
  protected graph: GraphHelper;
  protected options: CompilationOptions;
}
