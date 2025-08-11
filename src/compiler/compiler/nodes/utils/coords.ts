import { vector } from "@glsl/types/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

class CoordsNode extends CompilerNode {
  constructor() {
    super();
    this.addParameter(
      "center",
      "boolean",
      { type: "boolean", value: true },
      "center"
    );
    this.addParameter(
      "aspectRatio",
      "boolean",
      { type: "boolean", value: false },
      "Correct Ratio"
    );
  }
  override compile(node: NodeContext): Context {
    return this.createOutput(node, {
      type: vector("float", 2),
      data: this.buildExpression(node),
    });
  }

  protected buildExpression(node: NodeContext): string {
    const center = this.getParamValue(node, "center", "boolean");
    let expression = center ? "(vUv * 2.0 - 1.0)" : "vUv";
    if (this.getParamValue(node, "aspectRatio", "boolean")) {
      expression = `(${expression} * vec2(1.0, vResolution.x / vResolution.y))`;
    }
    return expression;
  }

  override getLabel(): string {
    return "coords";
  }

  override getDescription(): string {
    return "Coordinates of the current fragment, normalized to [0, 1] or [-1, 1]";
  }
}

export const coords = new CoordsNode();
