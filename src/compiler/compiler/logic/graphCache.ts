import type { Connection } from "@graph/connection";
import type { Node } from "@graph/node";
import type { SocketReference } from "@graph/socket";
import type { InputConnection } from "./compilerInternal";

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

  public cacheConnection(connection: Connection) {
    const id = connectionToID(connection);
    this.connectionsCache.set(id, connection);
    const key = globalToSocketRef(connection.to);
    this.getConnectedNode.set(key, {
      node: this.getNodeById(connection.from.nodeId)!,
      socketId: connection.from.socketId,
    });
  }

  public removeCachedConnection(connection: Connection) {
    const id = connectionToID(connection);
    this.connectionsCache.delete(id);
    const key = globalToSocketRef(connection.to);
    this.getConnectedNode.delete(key);
  }

  protected nodes: Map<string, Node> = new Map();
  protected getConnectedNode: Map<string, InputConnection> = new Map();
  protected connectionsCache: Map<string, Connection> = new Map();
}

function globalToSocketRef(ref: SocketReference): string {
  return `${ref.nodeId}///${ref.socketId}`;
}

export function connectionToID(ref: Connection): string {
  return `${globalToSocketRef(ref.from)}->${globalToSocketRef(ref.to)}`;
}
