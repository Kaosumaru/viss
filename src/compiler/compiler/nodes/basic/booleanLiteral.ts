import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { scalar } from "@glsl/types";

export class BooleanLiteralNode extends CompilerNode {
  constructor() {
    super();

    // Add parameter for boolean value
    this.addParameter("value", "boolean", { type: "boolean", value: false });

    this.addOutput("out", scalar("bool"));
  }

  override compile(node: NodeContext): Context {
    const value = this.getParamValue(node, "value", "boolean");
    const expression = value ? "true" : "false";
    return this.createOutput(node, {
      data: expression,
      type: scalar("bool"),
      trivial: true,
    });
  }

  override getLabel(): string {
    return "Bool";
  }

  override getDescription(): string {
    return "Boolean value (true/false)";
  }
}
