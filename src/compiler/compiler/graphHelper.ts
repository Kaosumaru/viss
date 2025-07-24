import type { Connection } from "@graph/connection";
import type { Graph, GraphDiff } from "@graph/graph";
import type { Node } from "@graph/node";
import { v4 as uuidv4 } from "uuid";
import type { Context } from "./context";

export interface InputConnection {
  node: Node;
  socketId: string;
}

export class GraphHelper {
  protected graph: Graph;
  constructor() {
    this.graph = {
      includes: [],
      nodes: [],
      connections: [],
    };
    this.graph.nodes.forEach((node) => this.nodes.set(node.identifier, node));

    this.graph.connections.forEach((connection) => {
      const fromNode = this.getNodeById(connection.from.nodeId);
      const toNode = this.getNodeById(connection.to.nodeId);
      if (fromNode && toNode) {
        this.getConnectedNode.set(
          `${toNode.identifier}///${connection.to.socketId}`,
          { node: fromNode, socketId: connection.from.socketId }
        );
      }
    });
  }

  addNode(node: Omit<Node, "identifier">): GraphDiff {
    const newNode: Node = {
      identifier: uuidv4(),
      ...node,
    };

    return {
      addedNodes: [newNode],
    };
  }

  removeNode(nodeId: string): GraphDiff {
    const node = this.getNodeById(nodeId);
    if (!node) throw new Error("Node not found");

    this.graph.nodes = this.graph.nodes.filter((n) => n.identifier !== nodeId);

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

  addConnection(connection: Connection): GraphDiff {
    // TODO throw error if connection is invalid (would cause loop or is of invalid type)

    this.invalidateNodes([connection.to.nodeId]);

    this.graph.connections.push(connection);
    return {
      addedConnections: [connection],
    };
  }

  removeConnection(connection: Connection): GraphDiff {
    const index = this.graph.connections.findIndex((conn) =>
      areConnectionsSame(conn, connection)
    );
    if (index === -1) {
      throw new Error("Connection not found in graph");
    }

    this.graph.connections.splice(index, 1);

    const invalidatedNodeIds = this.invalidateNodes([connection.to.nodeId]);

    return {
      removedConnections: [connection],
      invalidatedNodeIds,
    };
  }

  loadGraph(graph: Graph): void {
    this.graph = graph;
  }

  saveGraph(): Graph {
    return this.graph;
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

  public cacheContext(nodeId: string, context: Context) {
    this.cachedContexts.set(nodeId, context);
  }

  public getCachedContext(nodeId: string): Context | undefined {
    return this.cachedContexts.get(nodeId);
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

  protected cachedContexts: Map<string, Context> = new Map();

  protected getConnectedNode: Map<string, InputConnection> = new Map();
  protected nodes: Map<string, Node> = new Map();
}

function areConnectionsSame(conn1: Connection, conn2: Connection): boolean {
  return (
    conn1.from.nodeId === conn2.from.nodeId &&
    conn1.from.socketId === conn2.from.socketId &&
    conn1.to.nodeId === conn2.to.nodeId &&
    conn1.to.socketId === conn2.to.socketId
  );
}
