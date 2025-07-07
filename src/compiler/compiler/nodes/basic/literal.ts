import type { Type } from "@glsl/types";
import type { Context } from "../../context";
import { CompilerNode, type NodeContext } from "../compilerNode";

export class LiteralNode extends CompilerNode {
  constructor(type: Type) {
    super();
    this.type = type;
  }
  override compile(_ctx: Context, node: NodeContext): Context {
    const value = node.getParam("value") ?? 0;
    return {
      type: this.type,
      mainOutput: `${value}`,
    };
  }

  type: Type;
}
