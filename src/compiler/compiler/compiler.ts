import type { Node } from "@graph/node";
import type { Context } from "./context";
import { CompilerInternal } from "./logic/compilerInternal";
import type {
  AddedNodeInfo,
  FilePath,
  GLSLInclude,
  Graph,
  GraphDiff,
} from "@graph/graph";
import { type FunctionDefinition } from "@glsl/function";
import type { Connection } from "@graph/connection";
import type { ParameterValue } from "@graph/parameter";
import type { SocketReference } from "@graph/socket";
import type { Uniform } from "@graph/uniform";
import type { Type } from "@glsl/types/types";

export type IncludeResolver = (
  includeName: FilePath[]
) => Promise<(string | null)[]>;

export interface CompilationOptions {
  noVariables?: boolean;
  includeResolver?: IncludeResolver;
}

export class Compiler {
  constructor(options?: CompilationOptions) {
    this.graph = new CompilerInternal(options ?? {});
  }

  public getCustomFunctions(): FunctionDefinition[] {
    return this.graph.getCustomFunctions();
  }

  public getIncludes(): GLSLInclude[] {
    return this.graph.getIncludes();
  }

  compile(nodeId: string): Context {
    return this.graph.compile(nodeId);
  }

  public canConnect(output: SocketReference, input: SocketReference): boolean {
    return this.graph.canConnect(output, input);
  }

  public getOutputType(ref: SocketReference): Type {
    return this.graph.getOutputType(ref);
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

  public addGroup(nodes: string[], text?: string): GraphDiff {
    return this.graph.addGroup(nodes, text);
  }

  public removeGroup(groupId: string): GraphDiff {
    return this.graph.removeGroups([groupId]);
  }

  public updateGroup(
    groupId: string,
    nodes: string[],
    text?: string
  ): GraphDiff {
    return this.graph.updateGroup(groupId, nodes, text);
  }

  public translateNode(nodeId: string, x: number, y: number): GraphDiff {
    return this.graph.translateNode(nodeId, x, y);
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

  public updateUniform(uniform: Uniform): GraphDiff {
    return this.graph.updateUniform(uniform);
  }

  public addSuggestedConnection(
    fromNodeId: string,
    toNodeId: string
  ): GraphDiff {
    return this.graph.addSuggestedConnection(fromNodeId, toNodeId);
  }

  static createEmptyGraph(): Graph {
    return CompilerInternal.createGraph();
  }

  addInclude(include: FilePath): Promise<GraphDiff> {
    return this.graph.addIncludes([include]);
  }

  removeInclude(include: FilePath): GraphDiff {
    return this.graph.removeIncludes([include]);
  }

  includes(): FilePath[] {
    return this.graph.getIncludes().map((inc) => inc.path);
  }

  public updateUniformDefaultValue(
    name: string,
    defaultValue: ParameterValue
  ): GraphDiff {
    return this.graph.updateUniformDefaultValue(name, defaultValue);
  }

  public removeUniform(uniformId: string): GraphDiff {
    return this.graph.removeUniform(uniformId);
  }

  public removeConnection(connection: Connection): GraphDiff {
    return this.graph.removeConnection(connection);
  }

  public getInfo(nodeIds: string[]): AddedNodeInfo[] {
    return this.graph.getInfo(nodeIds);
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

  loadGraph(graph: Graph): Promise<GraphDiff> {
    return this.graph.loadGraph(graph);
  }

  getGraphAsDiff(): GraphDiff {
    return this.graph.getGraphAsDiff();
  }

  clearGraph() {
    this.graph.clearGraph();
  }

  protected graph: CompilerInternal;
}
