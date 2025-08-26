import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { sampler2D, vector } from "@glsl/types/types";

export class Texture2D extends CompilerNode {
  constructor() {
    super();
    this.addInput("texture", sampler2D());
    this.addInput("coord", vector("float", 2));
  }

  override compile(node: NodeContext): Context {
    const texture = node.tryGetInput("texture");
    const coord = node.tryGetInput("coord");
    if (!texture || !coord) {
      return this.createOutput(node, {
        type: vector("float", 4),
        data: `vec4(0)`,
      });
    }

    return this.createOutput(node, {
      type: vector("float", 4),
      data: `texture2D(${texture.data}, ${coord.data})`,
    });
  }

  override getLabel(): string {
    return `Texture2D`;
  }

  override getDescription(): string {
    return `Get a texel from a 2D texture`;
  }
}
