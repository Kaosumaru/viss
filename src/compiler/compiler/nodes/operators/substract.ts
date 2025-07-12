import { BinaryOperator } from "./binaryOperator";

class SubstractNode extends BinaryOperator {
  protected operationSymbol(): string {
    return "-";
  }
}

export const substract = new SubstractNode();
