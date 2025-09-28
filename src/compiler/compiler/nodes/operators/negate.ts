import { UnaryOperator } from "./unaryOperator";

class NegateNode extends UnaryOperator {
  protected operationSymbol(): string {
    return "-";
  }

  override getDescription(): string {
    return "Negation";
  }

  override getLabel(): string {
    return "Negate";
  }
}

export const negate = new NegateNode();
