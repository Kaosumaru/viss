import type { NodeType } from "@compiler/nodes/allNodes";
import type { Graph } from "@graph/graph";
import type { UICompilerNode } from "renderer/graph/nodes/compilerNode";

export interface EditorData {
  getNode(nodeId: string): UICompilerNode | undefined;
  destroy: () => void;
  clear: () => void;
  createNode: (
    nodeType: NodeType,
    space: "screen" | "absolute",
    x?: number,
    y?: number,
    id?: string
  ) => Promise<UICompilerNode>;
  deleteNode: (nodeId: string) => Promise<void>;

  loadGraph: (graphJson: string) => Promise<void>;
  saveGraph: () => Graph;

  compileNode: (nodeId?: string) => string | undefined;
}
