import type { NodeType } from "@compiler/nodes/allNodes";
import type { FunctionDefinition } from "@glsl/function";
import type { Graph } from "@graph/graph";
import type { Parameters } from "@graph/parameter";
import type { UICompilerNode } from "renderer/graph/nodes/compilerNode";

export interface EditorAPI {
  getNode(nodeId: string): UICompilerNode | undefined;
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

  loadGraph: (graphJson: string) => Promise<void>;
  saveGraph: () => Graph;

  compileNode: (nodeId?: string) => string | undefined;
  getCustomFunctions: () => FunctionDefinition[];
}
