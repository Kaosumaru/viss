import type { NodeType } from "@compiler/nodes/allNodes";
import type { FunctionDefinition } from "@glsl/function";
import type { Type } from "@glsl/types/types";
import type { FilePath, Graph } from "@graph/graph";
import type { Parameters, ParameterValue } from "@graph/parameter";
import type { SocketReference } from "@graph/socket";
import type { Uniform, Uniforms } from "@graph/uniform";
import type { UICompilerNode } from "renderer/graph/nodes/compilerNode";

export interface IUniformCallback {
  updateUniform: (uniform: Uniform) => void;
}

export interface EditorAPI {
  centerView: () => Promise<void>;
  updateUniformDefaultValue(
    name: string,
    defaultValue: ParameterValue
  ): unknown;
  getNode(nodeId: string): UICompilerNode | undefined;
  addSuggestedConnection: (
    fromNodeId: string,
    toNodeId: string
  ) => Promise<void>;

  arrangeNodes(nodeIds: string[]): Promise<void>;
  addComment(nodeIds: string[], text?: string): void;

  getSelectedNodes: () => string[];
  selectNodes: (nodeIds: string[]) => void;
  destroy: () => void;
  clear: () => Promise<void>;
  createNode: (
    nodeType: NodeType,
    space: "screen" | "absolute",
    x?: number,
    y?: number,
    params?: Parameters
  ) => Promise<string | undefined>;

  addUniformCallback: (callback: IUniformCallback) => () => void;

  isNodeSelected: (nodeId: string) => boolean;
  deleteNode: (nodeId: string) => Promise<void>;
  deleteNodes: (nodeIds: string[]) => Promise<void>;

  getOutputType(ref: SocketReference): Type;

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

  uniforms(): Uniforms;
  updateUniform: (uniform: Uniform) => Promise<void>;
  removeUniform: (uniformId: string) => Promise<void>;

  addIncludeFromFile: () => Promise<void>;
  addInclude: (include: FilePath) => Promise<void>;
  removeInclude: (include: FilePath) => Promise<void>;
  includes: () => FilePath[];

  compileNode: (nodeId?: string) => string | undefined;
  getCustomFunctions: () => FunctionDefinition[];
}
