import { genericFType, vector } from "@glsl/types/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

class OutputNode extends CompilerNode {
  constructor() {
    super();
    this.addInput("in", genericFType);
  }

  override compile(node: NodeContext): Context {
    const in_ = this.getInput(node, "in");

    if (in_.type.id === "scalar") {
      return this.createOutput(node, {
        name: "_preview",
        data: `vec4(vec3(${in_.data}), 1.0)`,
        type: vector(in_.type.type, 4),
      });
    }

    if (in_.type.id === "vector") {
      const type = vector(in_.type.type, 4);
      if (in_.type.size === 2) {
        return this.createOutput(node, {
          name: "_preview",
          data: `vec4(${in_.data}.xy, 0.0, 1.0)`,
          type,
        });
      }
      if (in_.type.size === 3) {
        return this.createOutput(node, {
          name: "_preview",
          data: `vec4(${in_.data}.xyz, 1.0)`,
          type,
        });
      }

      if (in_.type.size === 4) {
        return this.createOutput(node, {
          name: "_preview",
          ...in_,
        });
      }
    }
    throw new Error("Output node only supports scalar inputs");
  }

  override getLabel(): string {
    return "output";
  }

  override getDescription(): string {
    return "Output node to visualize input data as a vec4";
  }
}

export const output = new OutputNode();
