import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { scalar, vector } from "@glsl/types/types";

class DecomposeVector2 extends CompilerNode {
  constructor() {
    super();

    this.addInput("in", vector("float", 2));
  }

  override compile(node: NodeContext): Context {
    const inVec = this.getInput(node, "in");

    return this.createOutputs(node, [
      { type: scalar("float"), data: inVec.data + ".x", trivial: true },
      { type: scalar("float"), data: inVec.data + ".y", trivial: true },
    ]);
  }

  override getLabel(): string {
    return "decompose Vec2";
  }

  override getDescription(): string {
    return "Decompose a vec2 into its x and y components";
  }
}

export const decomposeVector2 = new DecomposeVector2();
