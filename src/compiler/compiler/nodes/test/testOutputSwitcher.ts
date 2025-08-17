import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { defaultExpressionForType } from "@glsl/types/defaultExpressionForType";
import { scalar } from "@glsl/types/types";

export class TestOutputSwitcher extends CompilerNode {
  constructor() {
    super();

    // Add parameter for boolean value
    this.addParameter("value", "boolean", { type: "boolean", value: false });
  }

  override compile(node: NodeContext): Context {
    const value = this.getParamValue(node, "value", "boolean");

    const type = value ? scalar("bool") : scalar("float");
    const expression = defaultExpressionForType(type);
    return this.createOutput(node, {
      data: expression.data,
      type: type,
      trivial: true,
    });
  }

  public canImplicitlyCastInput() {
    return false;
  }

  override getLabel(): string {
    return "Test Output";
  }

  override getDescription(): string {
    return "Bool or float";
  }
}
