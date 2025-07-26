import type { Node } from "@graph/node";
import type { Context } from "./context";
import { GraphHelper } from "./graphHelper";
import type { Graph, GraphDiff } from "@graph/graph";
import { type FunctionDefinition } from "@glsl/function";
import type { Connection } from "@graph/connection";
import type { ParameterValue } from "@graph/parameter";

export interface CompilationOptions {
  noVariables?: boolean;
}

export class Compiler {
  constructor(options?: CompilationOptions) {
    this.graph = new GraphHelper(options ?? {});
  }

  public getCustomFunctions(): FunctionDefinition[] {
    return this.graph.getCustomFunctions();
  }

  compile(nodeId: string): Context {
    return this.graph.compile(nodeId);
  }

  public addNode(node: Omit<Node, "identifier">): GraphDiff {
    return this.graph.addNode(node);
  }

  public removeNode(nodeId: string): GraphDiff {
    return this.graph.removeNode(nodeId);
  }

  public removeNodes(nodeIds: string[]): GraphDiff {
    return this.graph.removeNodes(nodeIds);
  }

  public translateNode(nodeId: string, x: number, y: number): void {
    this.graph.translateNode(nodeId, x, y);
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

  loadGraph(graph: Graph): GraphDiff {
    return this.graph.loadGraph(graph);
  }

  clearGraph() {
    return this.graph.clearGraph();
  }

  protected graph: GraphHelper;
}
