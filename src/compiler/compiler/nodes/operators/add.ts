import { BinaryOperator } from "./binaryOperator";

class AddNode extends BinaryOperator {
  protected operationSymbol(): string {
    return "+";
  }
}

export const add = new AddNode();
