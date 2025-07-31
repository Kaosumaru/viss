import { type Type } from "@glsl/types/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

export class GetMember extends CompilerNode {
  constructor(member: string, inputType: Type, outputType: Type) {
    super();
    this.member = member;
    this.addInput("in", inputType);
    this.outputType = outputType;
  }

  override compile(node: NodeContext): Context {
    const in_ = this.getInput(node, "in");
    return this.createOutput(node, {
      type: this.outputType,
      data: `${in_.data}.${this.member}`,
      trivial: true, // Uniforms are typically trivial
    });
  }

  override getLabel(): string {
    return `get ${this.member.toUpperCase()}`;
  }

  override getDescription(): string {
    return `Get the ${this.member} member from the input`;
  }

  outputType: Type;
  member: string;
}
