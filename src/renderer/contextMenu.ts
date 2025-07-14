import {
  ContextMenuPlugin,
  Presets as ContextMenuPresets,
} from "rete-context-menu-plugin";
import type { Schemes } from "./graph/node";
import type { ItemDefinition } from "rete-context-menu-plugin/_types/presets/classic/types";
import { UICompilerNode } from "./graph/nodes/compilerNode";
import { nodes } from "@compiler/nodes/allNodes";

export function createContextMenu(): ContextMenuPlugin<Schemes> {
  const def: ItemDefinition<Schemes>[] = [
    [
      "Literals",
      [
        ["Float", () => new UICompilerNode(nodes.float)],
        ["Vector2", () => new UICompilerNode(nodes.vector2)],
      ],
    ],
    [
      "Operators",
      [
        ["Add", () => new UICompilerNode(nodes.add)],
        ["Substract", () => new UICompilerNode(nodes.substract)],
      ],
    ],

    ["Output", [["Preview", () => new UICompilerNode(nodes.preview)]]],
  ];
  return new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup(def),
  });
}
