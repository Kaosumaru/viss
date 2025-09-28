import { variantAllScalarsVectors } from "@glsl/types/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context, Expression } from "@compiler/context";

export abstract class UnaryOperator extends CompilerNode {
  constructor() {
    super();
    this.addInput("in", variantAllScalarsVectors());
  }

  override compile(node: NodeContext): Context {
    const input = node.tryGetInput("in");
    if (!input) {
      return this.createOutputs(node, []);
    }

    const out = `(${this.operationSymbol(input)} ${input.data})`;

    return this.createOutput(node, {
      data: out,
      type: input.type,
      trivial: true,
    });
  }

  protected abstract operationSymbol(expression: Expression): string;
  public abstract getLabel(): string;
}
