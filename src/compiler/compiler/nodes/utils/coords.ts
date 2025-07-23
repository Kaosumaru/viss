import { vector } from "@glsl/types";
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
    this.addOutput("out", vector("float", 2));
  }
  override compile(node: NodeContext): Context {
    return this.createOutput(node, {
      data: this.buildExpression(node),
    });
  }

  protected buildExpression(node: NodeContext): string {
    const center = this.getParamValue(node, "center", "boolean");
    return center ? "v_uv * 2.0 - 1.0" : "v_uv";
  }

  override getLabel(): string {
    return "Coords";
  }

  override getDescription(): string {
    return "Coordinates of the current fragment, normalized to [0, 1] or [-1, 1]";
  }
}

export const coords = new CoordsNode();
