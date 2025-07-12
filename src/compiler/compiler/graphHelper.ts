import type { Graph } from "@graph/graph";
import type { Node } from "@graph/node";

export class GraphHelper {
  protected graph: Graph;
  constructor(graph: Graph) {
    this.graph = graph;
    this.graph.nodes.forEach((node) => this.nodes.set(node.identifier, node));
  }

  getNodeById(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  protected nodes: Map<string, Node> = new Map();
}
