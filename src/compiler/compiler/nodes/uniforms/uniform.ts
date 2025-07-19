import type { Type } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

export class UniformNode extends CompilerNode {
  constructor(uniformName: string, type: Type) {
    super();
    this.uniformName = uniformName;
    this.type = type;
    this.addOutput("out", type);
  }
  override compile(node: NodeContext): Context {
    return this.createOutput(node, this.uniformName, this.type);
  }

  override isTrivial(): boolean {
    return true;
  }

  override getLabel(): string {
    return this.uniformName;
  }

  uniformName: string;
  type: Type;
}
