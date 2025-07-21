import { BinaryOperator } from "./binaryOperator";

class AddNode extends BinaryOperator {
  protected operationSymbol(): string {
    return "+";
  }

  override getDescription(): string {
    return "Addition";
  }
}

export const add = new AddNode();
