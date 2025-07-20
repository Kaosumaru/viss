import { vector } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

class CoordsNode extends CompilerNode {
  constructor() {
    super();
    this.addOutput("out", vector("float", 2));
  }
  override compile(node: NodeContext): Context {
    return this.createOutput(node, {
      data: "(gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0",
    });
  }

  override getLabel(): string {
    return "Coords";
  }
}

export const coords = new CoordsNode();
