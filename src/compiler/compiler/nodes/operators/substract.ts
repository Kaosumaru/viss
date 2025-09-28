import { BinaryOperator } from "./binaryOperator";

class SubstractNode extends BinaryOperator {
  protected operationSymbol(): string {
    return "-";
  }

  override getDescription(): string {
    return "Substract";
  }
}

export const substract = new SubstractNode();
