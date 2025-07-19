import { Any } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

export abstract class BinaryOperator extends CompilerNode {
  constructor() {
    super();
    this.addInput("a", Any);
    this.addInput("b", Any);
    this.addOutput("out", Any);
  }

  override compile(node: NodeContext): Context {
    const ctxA = this.getInput(node, "a");
    const ctxB = this.getInput(node, "b");

    // TODO this needs either a cache or a type check
    /*
    if (ctxA.type !== ctxB.type) {
      throw new Error(
        `Type mismatch: cannot add ${ctxA.type} and ${ctxB.type}`
      );
    }*/

    if (ctxA.type.id !== "scalar") {
      throw new Error("AddNode only supports scalar types");
    }

    const out = `(${ctxA.mainOutput}) ${this.operationSymbol()} (${
      ctxB.mainOutput
    })`;

    return this.createSingleOutput(node, out, ctxA.type);
  }

  protected abstract operationSymbol(): string;

  override getLabel(): string {
    return this.operationSymbol();
  }
}
