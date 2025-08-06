import type { NodeType } from "@compiler/nodes/allNodes";
import type { FunctionDefinition } from "@glsl/function";
import type { Graph } from "@graph/graph";
import type { Parameters } from "@graph/parameter";
import type { UICompilerNode } from "renderer/graph/nodes/compilerNode";

export interface EditorAPI {
  getNode(nodeId: string): UICompilerNode | undefined;
  getSelectedNodes: () => string[];
  selectNodes: (nodeIds: string[]) => void;
  destroy: () => void;
  clear: () => void;
  createNode: (
    nodeType: NodeType,
    space: "screen" | "absolute",
    x?: number,
    y?: number,
    params?: Parameters
  ) => Promise<void>;

  deleteNode: (nodeId: string) => Promise<void>;
  deleteNodes: (nodeIds: string[]) => Promise<void>;

  copyNodes: (nodeIds: string[]) => string;
  pasteNodes: (
    diff: string,
    space: "screen" | "absolute",
    offsetX: number,
    offsetY: number
  ) => Promise<void>;

  loadGraphJSON: (graphJson: string) => Promise<void>;
  loadGraph: (graph: Graph) => Promise<void>;
  saveGraph: () => Graph;

  compileNode: (nodeId?: string) => string | undefined;
  getCustomFunctions: () => FunctionDefinition[];
}
