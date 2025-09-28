import type { Connection } from "@graph/connection";
import type { Node } from "@graph/node";
import type { SocketReference } from "@graph/socket";
import type { InputConnection } from "./compilerInternal";
import type { NodeInfo } from "@compiler/nodes/compilerNode";
import type { Type } from "@glsl/types/types";

interface NodeConnnectedSockets {
  inputs: Map<string, Connection[]>;
  outputs: Map<string, Connection[]>;
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

    for (const inputSocketId of connectedSockets.inputs.keys()) {
      if (nodeInfo.inputs.some((i) => i.name === inputSocketId)) continue;

      nodeInfo.inputs.push({
        name: inputSocketId,
        type: {
          id: "error",
        },
      });
    }

    for (const outputSocketId of connectedSockets.outputs.keys()) {
      if (nodeInfo.outputs.some((o) => o.name === outputSocketId)) continue;

      nodeInfo.outputs.push({
        name: outputSocketId,
        type: {
          id: "error",
        },
      });
    }
  }

  // if type of socket changes, type of all connections from that socket must be updated
  public updateOutputSocketType(
    identifier: string,
    outputSocketId: string,
    type: Type
  ) {
    const connected = this.getConnectedSockets(identifier);
    const connections = connected.outputs.get(outputSocketId);
    if (!connections) return;
    for (const connection of connections) {
      if (connection.type !== type) {
        connection.type = type;
      }
    }
  }

  public cacheConnection(connection: Connection) {
    const id = connectionToID(connection);
    this.connectionsCache.set(id, connection);
    const key = globalToSocketRef(connection.to);
    const node = this.getNodeById(connection.from.nodeId);
    if (!node) {
      throw new Error(
        `Node with ID ${connection.from.nodeId} not found in cache`
      );
    }
    this.getConnectedNode.set(key, {
      node,
      socketId: connection.from.socketId,
    });

    const fromNode = this.getConnectedSockets(connection.from.nodeId);
    const outputs = fromNode.outputs.get(connection.from.socketId);
    if (outputs) {
      outputs.push(connection);
    } else {
      fromNode.outputs.set(connection.from.socketId, [connection]);
    }

    const toNode = this.getConnectedSockets(connection.to.nodeId);
    const inputs = toNode.inputs.get(connection.to.socketId);
    if (inputs) {
      inputs.push(connection);
    } else {
      toNode.inputs.set(connection.to.socketId, [connection]);
    }
  }

  public removeCachedConnection(connection: Connection) {
    const id = connectionToID(connection);
    this.connectionsCache.delete(id);
    const key = globalToSocketRef(connection.to);
    this.getConnectedNode.delete(key);

    const fromNode = this.getConnectedSockets(connection.from.nodeId);
    const toNode = this.getConnectedSockets(connection.to.nodeId);

    // remove only the first occurrence (in case of multiple connections to the same socket)
    const fromOutputs = fromNode.outputs.get(connection.from.socketId);
    if (fromOutputs) {
      const index = fromOutputs.indexOf(connection);
      if (index !== -1) {
        fromOutputs.splice(index, 1);
      }
      if (fromOutputs.length === 0) {
        fromNode.outputs.delete(connection.from.socketId);
      }
    }

    const toInputs = toNode.inputs.get(connection.to.socketId);
    if (toInputs) {
      const index = toInputs.indexOf(connection);
      if (index !== -1) {
        toInputs.splice(index, 1);
      }
      if (toInputs.length === 0) {
        toNode.inputs.delete(connection.to.socketId);
      }
    }

    this.deleteConnectedSocketsIfEmpty(connection.from.nodeId);
    this.deleteConnectedSocketsIfEmpty(connection.to.nodeId);
  }

  protected getConnectedSockets(nodeId: string): NodeConnnectedSockets {
    const result = this.connectedSockets.get(nodeId);
    if (result) return result;

    const newConnectedSockets: NodeConnnectedSockets = {
      inputs: new Map(),
      outputs: new Map(),
    };
    this.connectedSockets.set(nodeId, newConnectedSockets);
    return newConnectedSockets;
  }

  protected deleteConnectedSocketsIfEmpty(nodeId: string) {
    const connected = this.connectedSockets.get(nodeId);
    if (
      connected &&
      connected.inputs.size === 0 &&
      connected.outputs.size === 0
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
