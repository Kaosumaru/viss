import { Any } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

class PreviewNode extends CompilerNode {
  constructor() {
    super();
    this.inputs.in = Any;
    this.outputs.out = Any;
  }

  override compile(node: NodeContext): Context {
    return node.getInput("in");
  }

  override getLabel(): string {
    return "Preview";
  }
}

export const preview = new PreviewNode();
