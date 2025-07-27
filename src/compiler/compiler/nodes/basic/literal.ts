import type { ScalarType } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { toFloat } from "@glsl/utils";

export class LiteralNode<T extends ScalarType> extends CompilerNode {
  constructor(type: T) {
    super();
    this.type = type;

    // Add parameter for value (so it can be manually entered)
    this.addParameter("value", "number", { type: "number", value: 0 });

    this.addOutput("out", type);
  }

  override compile(node: NodeContext): Context {
    const value = this.getParamValue(node, "value", "number");
    const expression = toFloat(value);

    return this.createOutput(node, {
      data: expression,
      type: this.type,
      trivial: true,
    });
  }

  override getLabel(): string {
    return `${this.type.type}`;
  }

  override getDescription(): string {
    return `Literal value of type ${this.type.type}`;
  }
  type: T;
}
