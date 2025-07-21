import type { Type } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

export class UniformNode extends CompilerNode {
  constructor(name: string, description: string, uniformName: string, type: Type) {
    super();
    this.uniformName = uniformName;
    this.type = type;
    this.name = name;
    this.description = description;
    this.addOutput("out", type);
  }
  override compile(node: NodeContext): Context {
    return this.createOutput(node, {
      data: this.uniformName,
      type: this.type,
      trivial: true, // Uniforms are typically trivial
    });
  }

  override getLabel(): string {
    return this.name;
  }

  override getDescription(): string {
    return this.description;
  }

  uniformName: string;
  type: Type;
  name: string;
  description: string;
}
