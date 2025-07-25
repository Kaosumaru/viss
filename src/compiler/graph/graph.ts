import type { NodeInfo } from "@compiler/nodes/compilerNode";
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

export interface AddedNodeInfo {
  node: Node;
  instanceInfo: NodeInfo;
}

export interface GraphDiff {
  addedNodes?: AddedNodeInfo[];
  removedNodes?: Node[];
  updatedNodes?: Node[];
  addedConnections?: Connection[];
  removedConnections?: Connection[];
  invalidatedNodeIds?: Set<string>;
}
