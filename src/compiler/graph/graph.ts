import type { Connection } from "./connection";

export interface Graph {
  nodes: Node[];
  connections: Connection[];
  comments?: Comment[];
}
