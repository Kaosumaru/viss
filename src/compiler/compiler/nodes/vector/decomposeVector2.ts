import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { scalar, vector } from "@glsl/types";

class DecomposeVector2 extends CompilerNode {
  constructor() {
    super();

    this.addInput("in", vector("float", 2));
    this.addOutput("x", scalar("float"));
    this.addOutput("y", scalar("float"));
  }

  override compile(node: NodeContext): Context {
    const inVec = this.getInput(node, "in");

    return this.createOutputs(node, [
      { data: inVec.data + ".x", trivial: true },
      { data: inVec.data + ".y", trivial: true },
    ]);
  }

  override getLabel(): string {
    return "Decompose Vec2";
  }
}

export const decomposeVector2 = new DecomposeVector2();
