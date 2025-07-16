import type { ScalarType } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

export class LiteralNode<T extends ScalarType> extends CompilerNode {
  constructor(type: T) {
    super();
    this.type = type;

    // Add input for value (so it can be connected)
    this.inputs.value = type;

    // Add parameter for value (so it can be manually entered)
    this.parameters.value = {
      type: "number",
      defaultValue: { type: "number", value: 0 },
    };

    this.outputs.out = type;
  }
  override compile(node: NodeContext): Context {
    // Try to get input first, fall back to parameter
    const inputContext = node.tryGetInput("value");
    if (inputContext) {
      // If there's a connection, use the input
      return inputContext;
    } else {
      // If no connection, use the parameter value
      const value = node.getParamValue("value", "number");
      const v = value.toLocaleString("en-GB", { minimumFractionDigits: 1 });
      return {
        type: this.type,
        mainOutput: v,
      };
    }
  }

  override getLabel(): string {
    return `${this.type.type}`;
  }
  type: T;
}
