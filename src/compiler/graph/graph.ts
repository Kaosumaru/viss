import type { Connection } from "./connection";
import type { Node } from "./node";

export interface Graph {
  includes: GLSLInclude[];
  nodes: Node[];
  connections: Connection[];
  // comments?: Comment[];
}

export interface GLSLInclude {
  name: string;
  content: string;
}

export interface GraphDiff {
  addedNodes?: Node[];
  removedNodes?: Node[];
  updatedNodes?: Node[];
  addedConnections?: Connection[];
  removedConnections?: Connection[];
  invalidatedNodeIds?: Set<string>;
}
