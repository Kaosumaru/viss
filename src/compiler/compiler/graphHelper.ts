import type { Graph } from "@graph/graph";
import type { Node } from "@graph/node";

export class GraphHelper {
  protected graph: Graph;
  constructor(graph: Graph) {
    this.graph = graph;
    this.graph.nodes.forEach((node) => this.nodes.set(node.identifier, node));

    this.graph.connections.forEach((connection) => {
      const fromNode = this.getNodeById(connection.from.nodeId);
      const toNode = this.getNodeById(connection.to.nodeId);
      if (fromNode && toNode) {
        this.getConnectedNode.set(
          `${toNode.identifier}///${connection.to.socketId}`,
          fromNode
        );
      }
    });
  }

  getInputNode(inputNodeId: string, inputSocketId: string): Node | undefined {
    return this.getConnectedNode.get(`${inputNodeId}///${inputSocketId}`);
  }

  getNodeById(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  protected getConnectedNode: Map<string, Node> = new Map();
  protected nodes: Map<string, Node> = new Map();
}
