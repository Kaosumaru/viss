import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

class ComposeVector4 extends CompilerNode {
  constructor() {
    super();

    this.addFloat("x");
    this.addFloat("y");
    this.addFloat("z");
    this.addFloat("w");
  }

  override compile(node: NodeContext): Context {
    const x = this.getFloat(node, "x");
    const y = this.getFloat(node, "y");
    const z = this.getFloat(node, "z");
    const w = this.getFloat(node, "w");

    return {
      type: this.outputs.out,
      mainOutput: `vec4(${x}, ${y}, ${z}, ${w})`,
    };
  }

  override getLabel(): string {
    return "Compose Vec4";
  }
}

export const composeVector4 = new ComposeVector4();
