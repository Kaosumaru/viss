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
    const inA = this.getInput(node, "a");
    const inB = this.getInput(node, "b");

    // TODO this needs either a cache or a type check
    /*
    if (ctxA.type !== ctxB.type) {
      throw new Error(
        `Type mismatch: cannot add ${ctxA.type} and ${ctxB.type}`
      );
    }*/

    const out = `(${inA.data} ${this.operationSymbol()} ${inB.data})`;

    // TODO better typing
    return this.createOutput(node, {
      expression: out,
      type: inA.type, // Assuming both inputs have the same type
      trivial: false,
    });
  }

  protected abstract operationSymbol(): string;

  override getLabel(): string {
    return this.operationSymbol();
  }
}
