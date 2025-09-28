import type { Expression } from "@compiler/context";
import { UnaryOperator } from "./unaryOperator";
import { componentType } from "@glsl/types/componentType";

class OneMinusNode extends UnaryOperator {
  protected operationSymbol(expression: Expression): string {
    const component = componentType(expression.type);
    switch (component) {
      case "int":
        return "1 - ";
      case "uint":
        return "1u - ";
      case "float":
        return "1.0 - ";
      case "bool":
        return "!";
    }
  }

  override getDescription(): string {
    return "1 - In";
  }

  override getLabel(): string {
    return "1 - In";
  }
}

export const oneMinusNode = new OneMinusNode();
