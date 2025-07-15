import { scalar, vector } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

class ComposeVector4 extends CompilerNode {
  constructor() {
    super();
    this.inputs.x = scalar("float");
    this.inputs.y = scalar("float");
    this.inputs.z = scalar("float");
    this.inputs.w = scalar("float");
    this.outputs.out = vector("float", 4);
  }

  override compile(node: NodeContext): Context {
    const ctxX = node.getInput("x");
    const ctxY = node.getInput("y");
    const ctxZ = node.getInput("z");
    const ctxW = node.getInput("w");

    return {
      type: this.outputs.out,
      mainOutput: `vec4(${ctxX.mainOutput}, ${ctxY.mainOutput}, ${ctxZ.mainOutput}, ${ctxW.mainOutput})`,
    };
  }

  override getLabel(): string {
    return "Preview";
  }
}

export const composeVector4 = new ComposeVector4();
