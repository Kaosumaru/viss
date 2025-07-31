import { genericFType } from "@glsl/types/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { createPreviewExpression } from "./utils";

class PreviewNode extends CompilerNode {
  constructor() {
    super();
    this.addInput("in", genericFType);
  }

  override compile(node: NodeContext): Context {
    const in_ = this.getInput(node, "in");

    const outputExpression = createPreviewExpression(in_);
    return this.createOutputs(node, [
      {
        ...in_,
      },
      outputExpression,
    ]);
  }

  override getLabel(): string {
    return "preview";
  }

  override getDescription(): string {
    return "Preview node to visualize input data as a vec4";
  }

  override showPreview(): boolean {
    return true;
  }
}

export const preview = new PreviewNode();
