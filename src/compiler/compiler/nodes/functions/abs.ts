import { scalar } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

class AbsFunction extends CompilerNode {
  constructor() {
    super();
    this.inputs.in = scalar("float");
    this.outputs.out = scalar("float");
  }

  override compile(node: NodeContext): Context {
    const ctx = node.getInput("in");
    return {
      type: this.outputs.out,
      mainOutput: `abs(${ctx.mainOutput})`,
    };
  }

  override getLabel(): string {
    return "Abs";
  }
}

export const abs = new AbsFunction();
