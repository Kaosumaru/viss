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
    return center
      ? "(gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0"
      : "gl_FragCoord.xy / u_resolution.xy";
  }

  override getLabel(): string {
    return "Coords";
  }
}

export const coords = new CoordsNode();
