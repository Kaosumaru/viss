import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { scalar, variant, vector } from "@glsl/types/types";

class DecomposeVector extends CompilerNode {
  constructor() {
    super();

    this.addInput(
      "in",
      variant([vector("float", 2), vector("float", 3), vector("float", 4)])
    );
  }

  override compile(node: NodeContext): Context {
    const inVec = this.getInput(node, "in");

    const type = scalar("float");
    return this.createOutputs(node, [
      { type, data: inVec.data + ".x", trivial: true },
      { type, data: inVec.data + ".y", trivial: true },
      { type, data: inVec.data + ".z", trivial: true },
      { type, data: inVec.data + ".w", trivial: true },
    ]);
  }

  override getLabel(): string {
    return "decompose Vector";
  }

  override getDescription(): string {
    return "Decompose a vec4 into its components";
  }
}

export const decomposeVector = new DecomposeVector();
