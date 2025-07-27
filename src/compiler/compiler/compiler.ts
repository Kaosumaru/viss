import type { Node } from "@graph/node";
import type { Context } from "./context";
import { CompilerInternal } from "./logic/compilerInternal";
import type { Graph, GraphDiff } from "@graph/graph";
import { type FunctionDefinition } from "@glsl/function";
import type { Connection } from "@graph/connection";
import type { ParameterValue } from "@graph/parameter";

export interface CompilationOptions {
  noVariables?: boolean;
}

export class Compiler {
  constructor(options?: CompilationOptions) {
    this.graph = new CompilerInternal(options ?? {});
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

  public copyNodes(nodeIds: string[]): Graph {
    return this.graph.copyNodes(nodeIds);
  }

  public pasteNodes(diff: Graph, offsetX: number, offsetY: number): GraphDiff {
    return this.graph.pasteNodes(diff, offsetX, offsetY);
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
    return this.graph.getGraph();
  }

  loadGraph(graph: Graph): GraphDiff {
    return this.graph.loadGraph(graph);
  }

  getGraphAsDiff(): GraphDiff {
    return this.graph.getGraphAsDiff();
  }

  clearGraph() {
    return this.graph.clearGraph();
  }

  protected graph: CompilerInternal;
}
