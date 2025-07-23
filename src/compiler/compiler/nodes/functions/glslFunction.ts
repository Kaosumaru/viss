import { Any } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

class GlslFunction extends CompilerNode {
  constructor() {
    super();

    this.addParameter("_name", "string");
  }

  override compile(node: NodeContext): Context {
    return this.createOutput(node, {
      data: `1`,
      type: Any,
      trivial: true,
    });
  }

  override getLabel(): string {
    return `Custom Function`;
  }

  override getDescription(): string {
    return `Custom Function`;
  }
}

export const glslFunction = new GlslFunction();
