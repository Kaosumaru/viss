import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { vector } from "@glsl/types";

class ComposeVector4 extends CompilerNode {
  constructor() {
    super();

    this.addFloat("x");
    this.addFloat("y");
    this.addFloat("z");
    this.addFloat("w");
    this.addOutput("out", vector("float", 4));
  }

  override compile(node: NodeContext): Context {
    const x = this.getFloat(node, "x");
    const y = this.getFloat(node, "y");
    const z = this.getFloat(node, "z");
    const w = this.getFloat(node, "w");

    return this.createOutput(node, `vec4(${x}, ${y}, ${z}, ${w})`);
  }

  override getLabel(): string {
    return "Compose Vec4";
  }
}

export const composeVector4 = new ComposeVector4();
