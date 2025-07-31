import {
  CompilerNode,
  type NodeContext,
  type OutputExpression,
} from "../compilerNode";
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

    const outputs: OutputExpression[] = [];
    if (inVec.type.id === "vector") {
      const members = ["x", "y", "z", "w"];
      for (let i = 0; i < inVec.type.size; i++) {
        outputs.push({
          type,
          name: members[i],
          data: `${inVec.data}.${members[i]}`,
          trivial: true,
        });
      }
    }

    return this.createOutputs(node, outputs);
  }

  override getLabel(): string {
    return "decompose Vector";
  }

  override getDescription(): string {
    return "Decompose a vector into its components";
  }
}

export const decomposeVector = new DecomposeVector();
