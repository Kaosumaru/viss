import type { Type } from "@glsl/types";
import type { Context } from "../../context";
import { CompilerNode, type NodeContext } from "../compilerNode";

export class LiteralNode<T extends Type> extends CompilerNode {
  constructor(type: T) {
    super();
    this.type = type;
    this.parameters.value = "number"; // TODO
    this.outputs.out = type;
  }
  override compile(_ctx: Context, node: NodeContext): Context {
    const value = node.getParam("value", "number");
    return {
      type: this.type,
      mainOutput: `${value}`,
    };
  }

  type: T;
}
