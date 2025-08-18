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
import deepEqual from "deep-equal";
import { canBeStrictlyConverted } from "@glsl/types/strictConversion";
import type { Uniform } from "@graph/uniform";

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
      uniforms: {},
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

    const canCast = nodeClass.canImplicitlyCastInput();

    const compiledContext = this.compile(output.nodeId);
    const info = nodeClass.getInfo(
      this.createNodeContextFor(node),
      compiledContext
    );
    const inputPin = info.inputs.find((pin) => pin.name === input.socketId);
    if (!inputPin) {
      return false;
    }
    return canCast
      ? canBeImplicitlyConverted(outputType, inputPin.type)
      : canBeStrictlyConverted(outputType, inputPin.type);
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

  insertNodes(nodes: Node[]): GraphDiff {
    const addedNodes: AddedNodeInfo[] = [];
    for (const node of nodes) {
      const newNode: Node = {
        ...node,
      };

      if (this.nodes.has(newNode.identifier)) {
        throw new Error(
          `Node with identifier ${newNode.identifier} already exists`
        );
      }
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

      addedNodes.push(this.getNodeInfo(newNode));
    }
    return { addedNodes };
  }

  removeNode(nodeId: string): GraphDiff {
    return this.removeNodes([nodeId]);
  }

  removeNodes(nodeIds: string[], removeOrphanedConnections = true): GraphDiff {
    const removedNodes: Node[] = [];
    const removedConnections: Connection[] = [];
    const invalidatedNodeIds: string[] = [];

    for (const nodeId of nodeIds) {
      const node = this.getNodeById(nodeId);
      if (!node) continue;

      this.graph.nodes = this.graph.nodes.filter(
        (n) => n.identifier !== nodeId
      );
      this.nodes.delete(nodeId);

      if (removeOrphanedConnections) {
        this.graph.connections = this.graph.connections.filter((c) => {
          if (c.from.nodeId !== nodeId && c.to.nodeId !== nodeId) {
            return true;
          }
          removedConnections.push(c);
          const ref = globalToSocketRef(c.to);
          this.getConnectedNode.delete(ref);
          this.connectionsCache.delete(connectionToID(c));
          return false;
        });
      }

      const nodesToInvalidate = removedConnections
        .filter((c) => c.from.nodeId === nodeId)
        .map((c) => c.to.nodeId);

      invalidatedNodeIds.push(...nodesToInvalidate);
      removedNodes.push(node);
    }

    return {
      removedNodes,
      removedConnections,
      invalidatedNodeIds: this.invalidateNodes(invalidatedNodeIds),
    };
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

  translateNode(nodeId: string, x: number, y: number): GraphDiff {
    const node = this.getNodeById(nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found in graph`);
    }

    if (node.position.x === x && node.position.y === y) {
      return {};
    }

    node.position.x = x;
    node.position.y = y;
    return {
      translatedNodes: new Set([nodeId]),
    };
  }

  addConnection(connection: Connection): GraphDiff {
    return this.addConnections([connection]);
  }

  addConnections(connections: Connection[]): GraphDiff {
    const addedConnections: Connection[] = [];
    const invalidatedNodeIds: string[] = [];

    for (const connection of connections) {
      const fromNode = this.getNodeById(connection.from.nodeId);
      if (!fromNode) {
        throw new Error(
          `From node with id ${connection.from.nodeId} not found in graph`
        );
      }

      // TODO throw error if connection is invalid (would cause loop or is of invalid type)
      const foundConnection = this.connectionsCache.get(
        connectionToID(connection)
      );
      if (foundConnection) {
        throw new Error("Connection already exists in graph");
      }

      connection.type = this.getOutputType(connection.from);
      this.graph.connections.push(connection);
      this.cacheConnection(connection);
      addedConnections.push(connection);
      invalidatedNodeIds.push(connection.to.nodeId);
    }

    return {
      addedConnections,
      invalidatedNodeIds: this.invalidateNodes(invalidatedNodeIds),
    };
  }

  removeConnection(connection: Connection): GraphDiff {
    return this.removeConnections([connection]);
  }

  removeConnections(connections: Connection[]): GraphDiff {
    const removedConnections: Connection[] = [];
    const invalidatedNodeIds: string[] = [];

    for (const connection of connections) {
      const id = connectionToID(connection);
      const foundConnection = this.connectionsCache.get(id);
      if (!foundConnection) {
        continue;
        // TODO this happen when playing with reapplied connections
        //throw new Error("Connection not found in graph");
      }

      this.graph.connections = this.graph.connections.filter(
        (conn) => conn !== foundConnection
      );
      const ref = globalToSocketRef(connection.to);
      this.getConnectedNode.delete(ref);
      this.connectionsCache.delete(id);

      removedConnections.push(connection);
      invalidatedNodeIds.push(connection.to.nodeId);
    }

    return {
      removedConnections: removedConnections,
      invalidatedNodeIds: this.invalidateNodes(invalidatedNodeIds),
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
      nodesWithModifiedProperties: [node],
    };
  }

  loadGraph(otherGraph: Graph): GraphDiff {
    const otherNodes = new Map(
      otherGraph.nodes.map((node) => [node.identifier, node])
    );

    const otherConnections = new Map(
      otherGraph.connections.map((conn) => [connectionToID(conn), conn])
    );

    const addedConnections = otherGraph.connections.filter(
      (conn) => !this.connectionsCache.has(connectionToID(conn))
    );

    const addedNodes = otherGraph.nodes.filter(
      (otherNode) => !this.nodes.has(otherNode.identifier)
    );

    const removedConnections: Connection[] = this.graph.connections.filter(
      (conn) => !otherConnections.has(connectionToID(conn))
    );

    const removedNodes = this.graph.nodes
      .filter((node) => !otherNodes.get(node.identifier))
      .map((node) => node.identifier);

    const modifiedNodes = this.graph.nodes.filter((node) => {
      const otherNode = otherNodes.get(node.identifier);
      if (!otherNode) return false;

      return !deepEqual(node, otherNode);
    });

    let diff: GraphDiff = {};

    diff = mergeGraphDiffs([diff, this.removeConnections(removedConnections)]);
    diff = mergeGraphDiffs([diff, this.removeNodes(removedNodes, false)]);
    diff = mergeGraphDiffs([diff, this.insertNodes(addedNodes)]);
    diff = mergeGraphDiffs([diff, this.addConnections(addedConnections)]);

    diff.nodesWithModifiedProperties = diff.nodesWithModifiedProperties
      ? [...diff.nodesWithModifiedProperties, ...modifiedNodes]
      : modifiedNodes;
    const invalidatedNodeIds = this.invalidateNodes(
      modifiedNodes.map((node) => node.identifier)
    );

    if (invalidatedNodeIds.size > 0 && !diff.invalidatedNodeIds) {
      diff.invalidatedNodeIds = new Set();
    }
    for (const node of invalidatedNodeIds) {
      diff.invalidatedNodeIds!.add(node);
    }

    for (const node of modifiedNodes) {
      const otherNode = otherNodes.get(node.identifier);
      if (otherNode) {
        node.position = {
          ...otherNode.position,
        };
        node.parameters = {
          ...otherNode.parameters,
        };
      }
    }

    return diff;
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

  removeUniform(uniformId: string): GraphDiff {
    this.graph.uniforms = Object.fromEntries(
      Object.entries(this.graph.uniforms).filter(([id]) => id !== uniformId)
    );
    const invalidatedNodeIds = this.invalidateNodes(
      this.getNodeIdsWithUniform(uniformId)
    );
    return {
      invalidatedNodeIds,
    };
  }

  updateUniform(uniform: Uniform): GraphDiff {
    this.graph.uniforms = { ...this.graph.uniforms, [uniform.id]: uniform };
    const invalidatedNodeIds = this.invalidateNodes(
      this.getNodeIdsWithUniform(uniform.id)
    );
    return {
      invalidatedNodeIds,
    };
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
      uniforms: {},
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

  protected getNodeIdsWithUniform(uniformId: string): string[] {
    return Array.from(this.nodes.values())
      .filter((node) => {
        const identifier = node.parameters["_identifier"];
        return identifier.value === uniformId;
      })
      .map((node) => node.identifier);
  }

  protected cacheContext(nodeId: string, context: Context) {
    this.cachedContexts.set(nodeId, context);
  }

  protected getCachedContext(nodeId: string): Context | undefined {
    return this.cachedContexts.get(nodeId);
  }

  protected cacheConnection(connection: Connection) {
    const id = connectionToID(connection);
    this.connectionsCache.set(id, connection);
    const key = globalToSocketRef(connection.to);
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
  protected connectionsCache: Map<string, Connection> = new Map();
  protected nodes: Map<string, Node> = new Map();
  protected nameToFunction: Record<string, FunctionDefinition> = {};
}

function globalToSocketRef(ref: SocketReference): string {
  return `${ref.nodeId}///${ref.socketId}`;
}

function connectionToID(ref: Connection): string {
  return `${globalToSocketRef(ref.from)}->${globalToSocketRef(ref.to)}`;
}
