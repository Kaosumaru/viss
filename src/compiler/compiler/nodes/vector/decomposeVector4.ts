import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { scalar, vector } from "@glsl/types";

class DecomposeVector4 extends CompilerNode {
  constructor() {
    super();

    this.addInput("in", vector("float", 4));
    this.addOutput("x", scalar("float"));
    this.addOutput("y", scalar("float"));
    this.addOutput("z", scalar("float"));
    this.addOutput("w", scalar("float"));
  }

  override compile(node: NodeContext): Context {
    const inVec = this.getInput(node, "in");

    return this.createOutputs(node, [
      { expression: inVec.expression + ".x", trivial: true },
      { expression: inVec.expression + ".y", trivial: true },
      { expression: inVec.expression + ".z", trivial: true },
      { expression: inVec.expression + ".w", trivial: true },
    ]);
  }

  override getLabel(): string {
    return "Decompose Vec4";
  }
}

export const decomposeVector4 = new DecomposeVector4();
