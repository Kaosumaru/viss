import { BinaryOperator } from "./binaryOperator";

class DivideNode extends BinaryOperator {
  protected operationSymbol(): string {
    return "/";
  }

  override getDescription(): string {
    return "Division";
  }
}

export const divide = new DivideNode();
