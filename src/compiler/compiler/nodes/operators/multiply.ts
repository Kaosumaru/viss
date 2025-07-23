import { BinaryOperator } from "./binaryOperator";

class MultiplyNode extends BinaryOperator {
  protected operationSymbol(): string {
    return "*";
  }

  override getDescription(): string {
    return "Multiplication";
  }
}

export const multiply = new MultiplyNode();
