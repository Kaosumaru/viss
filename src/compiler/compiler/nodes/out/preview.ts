import { Any } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

class PreviewNode extends CompilerNode {
  constructor() {
    super();
    this.inputs.in = Any;
    this.outputs.out = Any;
  }

  override compile(node: NodeContext): Context {
    const ctx = node.getInput("in");
    return {
      type: ctx.type,
      mainOutput: `vec4(${ctx.mainOutput},${ctx.mainOutput},${ctx.mainOutput},1.0)`,
    };
  }

  override getLabel(): string {
    return "Preview";
  }
}

export const preview = new PreviewNode();
