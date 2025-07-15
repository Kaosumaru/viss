import { scalar } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

class SinFunction extends CompilerNode {
  constructor() {
    super();
    this.inputs.in = scalar("float");
    this.outputs.out = scalar("float");
  }

  override compile(node: NodeContext): Context {
    const ctx = node.getInput("in");
    return {
      type: this.outputs.out,
      mainOutput: `sin(${ctx.mainOutput})`,
    };
  }

  override getLabel(): string {
    return "Sin";
  }
}

export const sin = new SinFunction();
