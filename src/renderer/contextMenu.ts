import {
  ContextMenuPlugin,
  Presets as ContextMenuPresets,
} from "rete-context-menu-plugin";
import type { Schemes } from "./graph/node";
import type { ItemDefinition } from "rete-context-menu-plugin/_types/presets/classic/types";
import { UICompilerNode } from "./graph/nodes/compilerNode";

export function createContextMenu(): ContextMenuPlugin<Schemes> {
  const def: ItemDefinition<Schemes>[] = [
    [
      "Literals",
      [
        ["Float", () => new UICompilerNode("float")],
        ["Vector2", () => new UICompilerNode("vector2")],
      ],
    ],
    [
      "Operators",
      [
        ["Add", () => new UICompilerNode("add")],
        ["Substract", () => new UICompilerNode("substract")],
      ],
    ],

    ["Output", [["Preview", () => new UICompilerNode("preview")]]],
  ];
  return new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup(def),
  });
}
