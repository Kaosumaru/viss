import type { NodeType } from "@compiler/nodes/allNodes";
import type { Graph } from "@graph/graph";
import type { AreaExtra, Schemes } from "renderer/graph/node";
import type { UICompilerNode } from "renderer/graph/nodes/compilerNode";
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";

export interface EditorData {
  destroy: () => void;
  clear: () => void;
  createNode: (
    nodeType: NodeType,
    x?: number,
    y?: number,
    id?: string
  ) => Promise<UICompilerNode>;

  loadGraph: (graphJson: string) => Promise<void>;
  saveGraph: () => Graph;

  compileNode: (nodeId?: string) => string | undefined;

  // TODO remove?
  editor: NodeEditor<Schemes>;
  area: AreaPlugin<Schemes, AreaExtra>;
}
