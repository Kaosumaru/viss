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
        // ["Vector2", () => new UICompilerNode("vector2")],
      ],
    ],
    [
      "Operators",
      [
        ["Add", () => new UICompilerNode("add")],
        ["Substract", () => new UICompilerNode("substract")],
        ["Divide", () => new UICompilerNode("divide")],
      ],
    ],

    [
      "Uniforms",
      [
        ["Time", () => new UICompilerNode("time")],
        ["FragCoord", () => new UICompilerNode("fragCoord")],
      ],
    ],
    [
      "Functions",
      [
        ["Sin", () => new UICompilerNode("sin")],
        ["Abs", () => new UICompilerNode("abs")],
      ],
    ],

    [
      "Vectors",
      [
        ["Compose Vec4", () => new UICompilerNode("composeVector4")],
        ["Get X", () => new UICompilerNode("getX")],
        ["Get Y", () => new UICompilerNode("getY")],
      ],
    ],

    ["Output", [["Preview", () => new UICompilerNode("preview")]]],
  ];
  return new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup(def),
  });
}
