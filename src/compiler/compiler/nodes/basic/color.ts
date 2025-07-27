import { vector } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

class ColorNode extends CompilerNode {
  constructor() {
    super();

    this.addParameter("value", "color", { type: "color", value: "#ff0000" });
    this.addOutput("out", vector("float", 4));
  }

  override compile(node: NodeContext): Context {
    return this.createOutput(node, {
      data: `vec4(1.0)`,
      type: vector("float", 4),
      trivial: true,
    });
  }

  override getLabel(): string {
    return "Color";
  }

  override getDescription(): string {
    return `Color literal`;
  }
}

export const color = new ColorNode();
