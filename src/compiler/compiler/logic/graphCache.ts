import type { Connection } from "@graph/connection";
import type { Node } from "@graph/node";
import type { SocketReference } from "@graph/socket";
import type { InputConnection } from "./compilerInternal";
import type { NodeInfo } from "@compiler/nodes/compilerNode";

interface NodeConnnectedSockets {
  inputs: string[];
  outputs: string[];
}

export class GraphCache {
  getConnectionById(id: string): Connection | undefined {
    return this.connectionsCache.get(id);
  }

  getNodeById(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  hasNode(identifier: string) {
    return this.nodes.has(identifier);
  }

  addNode(node: Node) {
    this.nodes.set(node.identifier, node);
  }

  removeNode(nodeId: string) {
    this.nodes.delete(nodeId);
  }

  allNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  getInputNode(
    inputNodeId: string,
    inputSocketId: string
  ): InputConnection | undefined {
    return this.getConnectedNode.get(`${inputNodeId}///${inputSocketId}`);
  }

  // some nodes (like Reroute) can have dynamic sockets that are not known until connections are made
  // and some connections can be then orhaned if the node is changed
  // this function adds missing sockets to the node info so that the connections are still valid
  addMissingSockets(nodeId: string, nodeInfo: NodeInfo) {
    const connectedSockets = this.connectedSockets.get(nodeId);
    if (!connectedSockets) return;

    for (const inputSocketId of connectedSockets.inputs) {
      if (nodeInfo.inputs.some((i) => i.name === inputSocketId)) continue;

      nodeInfo.inputs.push({
        name: inputSocketId,
        type: {
          id: "error",
        },
      });
    }

    for (const outputSocketId of connectedSockets.outputs) {
      if (nodeInfo.outputs.some((o) => o.name === outputSocketId)) continue;

      nodeInfo.outputs.push({
        name: outputSocketId,
        type: {
          id: "error",
        },
      });
    }
  }

  public cacheConnection(connection: Connection) {
    const id = connectionToID(connection);
    this.connectionsCache.set(id, connection);
    const key = globalToSocketRef(connection.to);
    this.getConnectedNode.set(key, {
      node: this.getNodeById(connection.from.nodeId)!,
      socketId: connection.from.socketId,
    });

    const fromNode = this.getConnectedSockets(connection.from.nodeId);
    fromNode.outputs.push(connection.from.socketId);

    const toNode = this.getConnectedSockets(connection.to.nodeId);
    toNode.inputs.push(connection.to.socketId);
  }

  public removeCachedConnection(connection: Connection) {
    const id = connectionToID(connection);
    this.connectionsCache.delete(id);
    const key = globalToSocketRef(connection.to);
    this.getConnectedNode.delete(key);

    const fromNode = this.getConnectedSockets(connection.from.nodeId);
    const toNode = this.getConnectedSockets(connection.to.nodeId);
    // remove only the first occurrence (in case of multiple connections to the same socket)
    fromNode.outputs.splice(
      fromNode.outputs.indexOf(connection.from.socketId),
      1
    );
    toNode.inputs.splice(toNode.inputs.indexOf(connection.to.socketId), 1);

    this.deleteConnectedSocketsIfEmpty(connection.from.nodeId);
    this.deleteConnectedSocketsIfEmpty(connection.to.nodeId);
  }

  protected getConnectedSockets(nodeId: string): NodeConnnectedSockets {
    const result = this.connectedSockets.get(nodeId);
    if (result) return result;

    const newConnectedSockets: NodeConnnectedSockets = {
      inputs: [],
      outputs: [],
    };
    this.connectedSockets.set(nodeId, newConnectedSockets);
    return newConnectedSockets;
  }

  protected deleteConnectedSocketsIfEmpty(nodeId: string) {
    const connected = this.connectedSockets.get(nodeId);
    if (
      connected &&
      connected.inputs.length === 0 &&
      connected.outputs.length === 0
    ) {
      this.connectedSockets.delete(nodeId);
    }
  }

  protected nodes: Map<string, Node> = new Map();
  protected getConnectedNode: Map<string, InputConnection> = new Map();
  protected connectionsCache: Map<string, Connection> = new Map();
  protected connectedSockets: Map<string, NodeConnnectedSockets> = new Map();
}

function globalToSocketRef(ref: SocketReference): string {
  return `${ref.nodeId}///${ref.socketId}`;
}

export function connectionToID(ref: Connection): string {
  return `${globalToSocketRef(ref.from)}->${globalToSocketRef(ref.to)}`;
}
