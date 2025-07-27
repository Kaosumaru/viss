import type { NodeType } from "@compiler/nodes/allNodes";
import type { FunctionDefinition } from "@glsl/function";
import type { Graph } from "@graph/graph";
import type { Parameters } from "@graph/parameter";
import type { UICompilerNode } from "renderer/graph/nodes/compilerNode";
import type { NodeId } from "rete";

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
  pasteNodes: (diff: string, offsetX: number, offsetY: number) => Promise<void>;

  loadGraph: (graphJson: string) => Promise<void>;
  saveGraph: () => Graph;

  compileNode: (nodeId?: string) => string | undefined;
  getCustomFunctions: () => FunctionDefinition[];
}

export type Selectable = {
  select: (nodeId: NodeId, accumulate: boolean) => void;
  unselect: (nodeId: NodeId) => void;
};
