import { vector } from "@glsl/types/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { toVec4 } from "@glsl/utils";

class ColorNode extends CompilerNode {
  constructor() {
    super();

    this.addParameter("value", "color", {
      type: "color",
      value: [1, 1, 1, 1],
    });
  }

  override compile(node: NodeContext): Context {
    const color = this.getParamValue(node, "value", "color");

    return this.createOutput(node, {
      data: toVec4(color),
      type: vector("float", 4),
      trivial: true,
    });
  }

  override getLabel(): string {
    return "color";
  }

  override getDescription(): string {
    return `Color literal`;
  }
}

export const color = new ColorNode();
