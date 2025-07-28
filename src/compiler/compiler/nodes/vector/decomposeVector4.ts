import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { scalar, vector } from "@glsl/types/types";

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
      { data: inVec.data + ".x", trivial: true },
      { data: inVec.data + ".y", trivial: true },
      { data: inVec.data + ".z", trivial: true },
      { data: inVec.data + ".w", trivial: true },
    ]);
  }

  override getLabel(): string {
    return "Decompose Vec4";
  }

  override getDescription(): string {
    return "Decompose a vec4 into its x, y, z, and w components";
  }
}

export const decomposeVector4 = new DecomposeVector4();
