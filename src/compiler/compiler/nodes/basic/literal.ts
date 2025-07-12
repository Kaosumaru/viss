import type { Type } from "@glsl/types";
import type { Context } from "../../context";
import { CompilerNode, type NodeContext } from "../compilerNode";

export class LiteralNode<T extends Type> extends CompilerNode {
  constructor(type: T) {
    super();
    this.type = type;
    this.parameters.value = "number"; // TODO should also support Vector and Matrix types
    this.outputs.out = type;
  }
  override compile(node: NodeContext): Context {
    const value = node.getParamValue("value", "number");
    return {
      type: this.type,
      mainOutput: `${value}`,
    };
  }

  type: T;
}
