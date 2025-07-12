import type { Connection } from "./connection";
import type { Node } from "./node";

export interface Graph {
  nodes: Node[];
  connections: Connection[];
  // comments?: Comment[];
}
