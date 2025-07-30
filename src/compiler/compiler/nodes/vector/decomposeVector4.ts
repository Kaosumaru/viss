import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { variant, vector } from "@glsl/types/types";

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

    return this.createOutputs(node, [
      { data: inVec.data + ".x", trivial: true },
      { data: inVec.data + ".y", trivial: true },
      { data: inVec.data + ".z", trivial: true },
      { data: inVec.data + ".w", trivial: true },
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
