import { Any, vector } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

class PreviewNode extends CompilerNode {
  constructor() {
    super();
    this.addInput("in", Any);
    this.addOutput("out", Any);
  }

  override compile(node: NodeContext): Context {
    const in_ = this.getInput(node, "in");

    if (in_.type.id === "scalar") {
      return this.createOutput(node, {
        expression: `vec4(vec3(${in_.data}), 1.0)`,
        type: vector(in_.type.type, 4),
      });
    }

    if (in_.type.id === "vector") {
      const type = vector(in_.type.type, 4);
      if (in_.type.size === 2) {
        return this.createOutput(node, {
          expression: `vec4(${in_.data}.xy, 0.0, 1.0)`,
          type,
        });
      }
      if (in_.type.size === 3) {
        return this.createOutput(node, {
          expression: `vec4(${in_.data}.xyz, 1.0)`,
          type,
        });
      }

      if (in_.type.size === 4) {
        return this.createOutput(node, {
          expression: in_.data,
          type: in_.type,
        });
      }
    }
    throw new Error("Preview node only supports scalar inputs");
  }

  override getLabel(): string {
    return "Preview";
  }
}

export const preview = new PreviewNode();
