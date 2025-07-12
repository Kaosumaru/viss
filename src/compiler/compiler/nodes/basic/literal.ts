import type { ScalarType } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

export class LiteralNode<T extends ScalarType> extends CompilerNode {
  constructor(type: T) {
    super();
    this.type = type;
    // TODO should also support Vector and Matrix types
    this.parameters.value = {
      type: "number",
      defaultValue: { type: "number", value: 0 },
    };

    this.outputs.out = type;
  }
  override compile(node: NodeContext): Context {
    const value = node.getParamValue("value", "number");
    return {
      type: this.type,
      mainOutput: `${value}`,
    };
  }

  override getLabel(): string {
    return `${this.type.type}`;
  }
  type: T;
}
