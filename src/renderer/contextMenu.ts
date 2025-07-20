import {
  ContextMenuPlugin,
  Presets as ContextMenuPresets,
} from "rete-context-menu-plugin";
import type { Schemes } from "./graph/node";
import type { ItemDefinition } from "rete-context-menu-plugin/_types/presets/classic/types";
import { UICompilerNode } from "./graph/nodes/compilerNode";
import type { NodeType } from "@compiler/nodes/allNodes";

export function createContextMenu(): ContextMenuPlugin<Schemes> {
  const def: ItemDefinition<Schemes>[] = [
    [
      "Literals",
      [
        ["Float", () => n("float")],
        ["Bool", () => n("bool")],
        // ["Vector2", () => new UICompilerNode("vector2")],
      ],
    ],
    [
      "Operators",
      [
        ["Add", () => n("add")],
        ["Substract", () => n("substract")],
        ["Divide", () => n("divide")],
      ],
    ],

    [
      "Uniforms",
      [
        ["Time", () => n("time")],
        ["FragCoord", () => n("fragCoord")],
      ],
    ],
    [
      "Functions",
      [
        ["Sin", () => n("sin")],
        ["Abs", () => n("abs")],
      ],
    ],

    [
      "Vectors",
      [
        ["Compose Vec4", () => n("composeVector4")],
        ["Get X", () => n("getX")],
        ["Get Y", () => n("getY")],
      ],
    ],

    ["Output", [["Preview", () => n("preview")]]],
  ];
  return new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup(def),
  });
}

function n(type: NodeType) {
  return new UICompilerNode(type);
}
