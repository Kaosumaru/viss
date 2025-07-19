import { type Type } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

export class GetMember extends CompilerNode {
  constructor(member: string, inputType: Type, outputType: Type) {
    super();
    this.member = member;
    this.addInput("in", inputType);
    this.addOutput("out", outputType);
  }

  override compile(node: NodeContext): Context {
    const ctx = this.getInput(node, "in");
    return this.createSingleOutput(node, `${ctx.mainOutput}.${this.member}`);
  }

  override isTrivial(): boolean {
    return true;
  }

  override getLabel(): string {
    return `Get ${this.member.toUpperCase()}`;
  }

  member: string;
}
