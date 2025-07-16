import { Any, vector } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

class PreviewNode extends CompilerNode {
  constructor() {
    super();
    this.inputs.in = Any;
    this.outputs.out = Any;
  }

  override compile(node: NodeContext): Context {
    const ctx = this.getInput(node, "in");
    if (ctx.type.id === "scalar") {
      return {
        type: vector(ctx.type.type, 4),
        mainOutput: `vec4(vec3(${ctx.mainOutput}), 1.0)`,
      };
    }

    if (ctx.type.id === "vector") {
      if (ctx.type.size === 2) {
        return {
          type: vector(ctx.type.type, 4),
          mainOutput: `vec4(${ctx.mainOutput}.xy, 0.0, 1.0)`,
        };
      }
      if (ctx.type.size === 3) {
        return {
          type: vector(ctx.type.type, 4),
          mainOutput: `vec4(${ctx.mainOutput}.xyz, 1.0)`,
        };
      }

      if (ctx.type.size === 4) {
        return ctx;
      }
    }
    throw new Error("Preview node only supports scalar inputs");
  }

  override getLabel(): string {
    return "Preview";
  }
}

export const preview = new PreviewNode();
