import { BinaryOperator } from "./binaryOperator";

class AddNode extends BinaryOperator {
  protected operationSymbol(): string {
    return "+";
  }

  override getDescription(): string {
    return "Add";
  }
}

export const add = new AddNode();
