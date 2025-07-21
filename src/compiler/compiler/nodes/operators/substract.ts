import { BinaryOperator } from "./binaryOperator";

class SubstractNode extends BinaryOperator {
  protected operationSymbol(): string {
    return "-";
  }

  override getDescription(): string {
    return "Addition";
  }
}

export const substract = new SubstractNode();
