import { Any } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

class AddNode extends CompilerNode {
  constructor() {
    super();
    this.inputs.a = Any;
    this.inputs.b = Any;
    this.outputs.out = Any;
  }
  override compile(node: NodeContext): Context {
    const ctxA = node.getInput("a");
    const ctxB = node.getInput("b");

    if (ctxA.type !== ctxB.type) {
      throw new Error(
        `Type mismatch: cannot add ${ctxA.type} and ${ctxB.type}`
      );
    }

    if (ctxA.type.id !== "scalar") {
      throw new Error("AddNode only supports scalar types");
    }

    return {
      type: ctxA.type,
      mainOutput: `${ctxA.mainOutput} + ${ctxB.mainOutput}`,
    };
  }
}

export const add = new AddNode();
