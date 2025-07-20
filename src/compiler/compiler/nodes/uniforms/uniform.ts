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
    return this.createOutput(node, {
      expression: this.uniformName,
      type: this.type,
      trivial: true, // Uniforms are typically trivial
    });
  }

  override getLabel(): string {
    return this.uniformName;
  }

  uniformName: string;
  type: Type;
}
