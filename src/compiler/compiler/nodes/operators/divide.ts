import { BinaryOperator } from "./binaryOperator";

class DivideNode extends BinaryOperator {
  protected operationSymbol(): string {
    return "/";
  }
}

export const divide = new DivideNode();
