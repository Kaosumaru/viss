import type { NodeType } from "@compiler/nodes/allNodes";
import type { FunctionDefinition } from "@glsl/function";
import type { Graph } from "@graph/graph";
import type { Parameters, ParameterValue } from "@graph/parameter";
import type { Uniform, Uniforms } from "@graph/uniform";
import type { UICompilerNode } from "renderer/graph/nodes/compilerNode";

export interface IUniformCallback {
  updateUniform: (uniform: Uniform) => void;
}

export interface EditorAPI {
  updateUniformDefaultValue(
    name: string,
    defaultValue: ParameterValue
  ): unknown;
  getNode(nodeId: string): UICompilerNode | undefined;

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
  ) => Promise<void>;

  addUniformCallback: (callback: IUniformCallback) => () => void;

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

  uniforms(): Uniforms;
  updateUniform: (uniform: Uniform) => Promise<void>;
  removeUniform: (uniformId: string) => Promise<void>;

  compileNode: (nodeId?: string) => string | undefined;
  getCustomFunctions: () => FunctionDefinition[];
}
