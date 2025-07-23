import { Any, vector } from "@glsl/types";
import {
  CompilerNode,
  type NodeContext,
  type OutputExpression,
} from "../compilerNode";
import type { Context } from "@compiler/context";

class PreviewNode extends CompilerNode {
  constructor() {
    super();
    this.addInput("in", Any);
    this.addOutput("out", Any);
    this.addOutput("_preview", Any);
  }

  override compile(node: NodeContext): Context {
    const in_ = this.getInput(node, "in");

    let outputExpression: OutputExpression | null = null;
    if (in_.type.id === "scalar") {
      outputExpression = {
        data: `vec4(vec3(${in_.data}), 1.0)`,
        type: vector(in_.type.type, 4),
      };
    } else if (in_.type.id === "vector") {
      const type = vector(in_.type.type, 4);
      if (in_.type.size === 2) {
        outputExpression = {
          data: `vec4(${in_.data}.xy, 0.0, 1.0)`,
          type,
        };
      } else if (in_.type.size === 3) {
        outputExpression = {
          data: `vec4(${in_.data}.xyz, 1.0)`,
          type,
        };
      } else if (in_.type.size === 4) {
        outputExpression = {
          data: in_.data,
          type: vector(in_.type.type, 4),
        };
      }
    }
    if (!outputExpression)
      throw new Error("Preview node only supports scalar inputs");
    return this.createOutputs(node, [
      {
        ...in_,
      },
      outputExpression,
    ]);
  }

  override getLabel(): string {
    return "Preview";
  }

  override getDescription(): string {
    return "Preview node to visualize input data as a vec4";
  }

  override showPreview(): boolean {
    return true;
  }
}

export const preview = new PreviewNode();
