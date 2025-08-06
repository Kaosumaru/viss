import type { Connection } from "@graph/connection";
import {
  mergeGraphDiffs,
  type AddedNodeInfo,
  type Graph,
  type GraphDiff,
} from "@graph/graph";
import type { Node } from "@graph/node";
import { v4 as uuidv4 } from "uuid";
import type { Context } from "../context";
import type { ParameterValue } from "@graph/parameter";
import { getNode, type NodeType } from "../nodes/allNodes";
import { CompileNodeContext } from "../compilerNodeContext";
import type { NodeContext } from "../nodes/compilerNode";
import type { CompilationOptions } from "../compiler";
import { parseFunctionsFrom, type FunctionDefinition } from "@glsl/function";
import { getBuiltInFunctions } from "@glsl/builtInIncludes";
import { copyNodes } from "./copyNodes";
import { pasteNodes } from "./pasteNodes";
import type { Type } from "@glsl/types/types";
import type { SocketReference } from "@graph/socket";
import { canBeImplicitlyConverted } from "@glsl/types/implicitConversion";

export interface InputConnection {
  node: Node;
  socketId: string;
}

export class CompilerInternal {
  static readonly graphVersion = 1;
  protected graph: Graph;
  protected options: CompilationOptions;

  constructor(options: CompilationOptions) {
    this.options = options;
    this.graph = {
      version: CompilerInternal.graphVersion,
      includes: [],
      nodes: [],
      connections: [],
    };
    this.clearGraph();
  }

  public getCustomFunctions(): FunctionDefinition[] {
    return Object.values(this.nameToFunction);
  }

  public tryGetFunctionDefinition(
    name: string
  ): FunctionDefinition | undefined {
    return this.nameToFunction[name];
  }

  public createNodeContextFor(node: Node): NodeContext {
    return new CompileNodeContext(this.options, this, node);
  }

  compile(nodeId: string): Context {
    const node = this.getNodeById(nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found in graph`);
    }

    const cacheContext = this.getCachedContext(node.identifier);
    if (cacheContext) {
      return cacheContext;
    }

    const compilerNode = getNode(node.nodeType as NodeType);
    const nodeContext = this.createNodeContextFor(node);

    const ctx = compilerNode.compile(nodeContext);
    this.cacheContext(node.identifier, ctx);
    return ctx;
  }

  generateNodeId(): string {
    return uuidv4().replaceAll("-", "_");
  }

  public canConnect(output: SocketReference, input: SocketReference): boolean {
    const outputType = this.getOutputType(output);
    const node = this.getNodeById(input.nodeId);
    if (!node) {
      return false;
    }
    const nodeClass = getNode(node.nodeType as NodeType);
    if (!nodeClass) {
      return false;
    }

    const compiledContext = this.compile(output.nodeId);
    const info = nodeClass.getInfo(
      this.createNodeContextFor(node),
      compiledContext
    );
    const inputPin = info.inputs.find((pin) => pin.name === input.socketId);
    if (!inputPin) {
      return false;
    }
    return canBeImplicitlyConverted(outputType, inputPin.type);
  }

  addNode(node: Omit<Node, "identifier">): GraphDiff {
    const newNode: Node = {
      identifier: this.generateNodeId(),
      ...node,
    };

    // initialize default values in node
    const nodeClass = getNode(newNode.nodeType as NodeType);
    if (!nodeClass) {
      throw new Error(`Node type "${newNode.nodeType}" not found`);
    }
    newNode.parameters = {
      ...nodeClass.getDefaultParameters(),
      ...newNode.parameters,
    };

    this.nodes.set(newNode.identifier, newNode);
    this.graph.nodes.push(newNode);

    return {
      addedNodes: [this.getNodeInfo(newNode)],
    };
  }

  removeNode(nodeId: string): GraphDiff {
    const node = this.getNodeById(nodeId);
    if (!node) throw new Error("Node not found");

    this.graph.nodes = this.graph.nodes.filter((n) => n.identifier !== nodeId);
    this.nodes.delete(nodeId);

    const removedConnections: Connection[] = [];

    this.graph.connections = this.graph.connections.filter((c) => {
      if (c.from.nodeId !== nodeId && c.to.nodeId !== nodeId) {
        return true;
      }
      removedConnections.push(c);
      return false;
    });

    const nodesToInvalidate = removedConnections
      .filter((c) => c.from.nodeId === nodeId)
      .map((c) => c.to.nodeId);

    const invalidatedNodeIds = this.invalidateNodes(nodesToInvalidate);

    return {
      removedNodes: [node],
      removedConnections,
      invalidatedNodeIds,
    };
  }

  removeNodes(nodeIds: string[]): GraphDiff {
    const diffs: GraphDiff[] = nodeIds.map((nodeId) => this.removeNode(nodeId));
    return mergeGraphDiffs(diffs);
  }

  getInfo(nodeIds: string[]): AddedNodeInfo[] {
    return nodeIds.map((nodeId) => {
      const node = this.getNodeById(nodeId);
      if (!node) {
        throw new Error(`Node with id ${nodeId} not found in graph`);
      }
      return this.getNodeInfo(node);
    });
  }

  translateNode(nodeId: string, x: number, y: number) {
    const node = this.getNodeById(nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found in graph`);
    }

    node.position.x = x;
    node.position.y = y;
  }

  addConnection(connection: Connection): GraphDiff {
    const fromNode = this.getNodeById(connection.from.nodeId);
    if (!fromNode) {
      throw new Error(
        `From node with id ${connection.from.nodeId} not found in graph`
      );
    }

    // TODO throw error if connection is invalid (would cause loop or is of invalid type)
    const index = this.graph.connections.findIndex((conn) =>
      areConnectionsSame(conn, connection)
    );
    if (index !== -1) {
      throw new Error("Connection already exists in graph");
    }
    const invalidatedNodeIds = this.invalidateNodes([connection.to.nodeId]);

    connection.type = this.getOutputType(connection.from);
    this.graph.connections.push(connection);
    this.cacheConnection(connection);

    return {
      addedConnections: [connection],
      invalidatedNodeIds,
    };
  }

  removeConnection(connection: Connection): GraphDiff {
    const index = this.graph.connections.findIndex((conn) =>
      areConnectionsSame(conn, connection)
    );
    if (index === -1) {
      return {};
      // TODO this happen when playing with reapplied connections
      //throw new Error("Connection not found in graph");
    }

    this.graph.connections.splice(index, 1);
    const ref = globalToSocketRef(connection);
    this.getConnectedNode.delete(ref);

    const invalidatedNodeIds = this.invalidateNodes([connection.to.nodeId]);

    return {
      removedConnections: [connection],
      invalidatedNodeIds,
    };
  }

  updateParameter(nodeId: string, paramName: string, value: ParameterValue) {
    const node = this.getNodeById(nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found in graph`);
    }
    node.parameters[paramName] = value;
    const invalidatedNodeIds = this.invalidateNodes([nodeId]);

    return {
      invalidatedNodeIds,
    };
  }

  loadGraph(graph: Graph): GraphDiff {
    this.clearGraph();
    this.graph = graph;
    this.graph.nodes.forEach((node) => this.nodes.set(node.identifier, node));

    this.graph.connections.forEach((connection) => {
      this.cacheConnection(connection);
    });

    return this.getGraphAsDiff();
  }

  getGraphAsDiff(): GraphDiff {
    return {
      addedNodes: this.graph.nodes.map((node) => this.getNodeInfo(node)),
      addedConnections: this.graph.connections,
      invalidatedNodeIds: new Set(
        this.graph.nodes.map((node) => node.identifier)
      ),
    };
  }

  pasteNodes(graph: Graph, offsetX: number, offsetY: number): GraphDiff {
    return pasteNodes(this, graph, offsetX, offsetY);
  }

  copyNodes(nodeIds: string[]): Graph {
    return copyNodes(this, nodeIds);
  }

  getGraph(): Graph {
    return this.graph;
  }

  clearGraph() {
    this.nodes.clear();
    this.getConnectedNode.clear();
    this.cachedContexts.clear();
    this.nodes.clear();
    this.graph = {
      version: CompilerInternal.graphVersion,
      includes: getBuiltInFunctions(),
      nodes: [],
      connections: [],
    };

    this.nameToFunction = parseFunctionsFrom(this.graph);
  }

  getInputNode(
    inputNodeId: string,
    inputSocketId: string
  ): InputConnection | undefined {
    return this.getConnectedNode.get(`${inputNodeId}///${inputSocketId}`);
  }

  getNodeById(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  hasNode(identifier: string) {
    return this.nodes.has(identifier);
  }

  protected cacheContext(nodeId: string, context: Context) {
    this.cachedContexts.set(nodeId, context);
  }

  protected getCachedContext(nodeId: string): Context | undefined {
    return this.cachedContexts.get(nodeId);
  }

  protected cacheConnection(connection: Connection) {
    const key = globalToSocketRef(connection);
    this.getConnectedNode.set(key, {
      node: this.getNodeById(connection.from.nodeId)!,
      socketId: connection.from.socketId,
    });
  }

  protected getNodeInfo(node: Node): AddedNodeInfo {
    const nodeClass = getNode(node.nodeType as NodeType);
    try {
      const compiledContext = this.compile(node.identifier);
      return {
        node,
        instanceInfo: nodeClass.getInfo(
          this.createNodeContextFor(node),
          compiledContext
        ),
      };
    } catch (error) {
      return {
        node,
        instanceInfo: {
          name: nodeClass.getLabel(),
          showPreview: false,
          inputs: [],
          outputs: [],
          parameters: [],
          description: "Error compiling node",
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  protected invalidateNodes(nodeIds: string[]): Set<string> {
    const invalidatedNodeIds: Set<string> = new Set();
    const visitedNodes: Set<string> = new Set();
    const nodesToCheck: string[] = nodeIds;
    while (nodesToCheck.length > 0) {
      const currentNodeId = nodesToCheck.pop();
      if (!currentNodeId) continue;

      const node = this.getNodeById(currentNodeId);
      if (!node)
        throw new Error(`Node with id ${currentNodeId} not found in graph`);

      // mark the node as dirty
      this.cachedContexts.delete(node.identifier);
      invalidatedNodeIds.add(node.identifier);

      // find all connected nodes and add them to the list to check
      this.graph.connections.forEach((connection) => {
        if (
          connection.from.nodeId === currentNodeId &&
          !visitedNodes.has(connection.to.nodeId)
        ) {
          nodesToCheck.push(connection.to.nodeId);
          visitedNodes.add(connection.to.nodeId);
        }
      });
    }

    return invalidatedNodeIds;
  }

  protected getOutputType(ref: SocketReference): Type {
    const ctx = this.compile(ref.nodeId);
    const socket = ctx.outputs[ref.socketId];
    if (!socket) {
      throw new Error(
        `Output socket with id ${ref.socketId} not found in node ${ref.nodeId}`
      );
    }
    return socket.type;
  }

  protected cachedContexts: Map<string, Context> = new Map();
  protected getConnectedNode: Map<string, InputConnection> = new Map();
  protected nodes: Map<string, Node> = new Map();
  protected nameToFunction: Record<string, FunctionDefinition> = {};
}

function areConnectionsSame(conn1: Connection, conn2: Connection): boolean {
  return (
    conn1.from.nodeId === conn2.from.nodeId &&
    conn1.from.socketId === conn2.from.socketId &&
    conn1.to.nodeId === conn2.to.nodeId &&
    conn1.to.socketId === conn2.to.socketId
  );
}

function globalToSocketRef(connection: Connection): string {
  return `${connection.to.nodeId}///${connection.to.socketId}`;
}
