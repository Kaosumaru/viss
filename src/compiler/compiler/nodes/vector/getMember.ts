import { scalar, vector } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

export class GetMember extends CompilerNode {
  constructor(member: string) {
    super();
    this.member = member;

    // TODO
    this.inputs.in = vector("float", 2);
    this.outputs.out = scalar("float");
  }

  override compile(node: NodeContext): Context {
    const ctx = node.getInput("in");
    return {
      type: this.outputs.out,
      mainOutput: `${ctx.mainOutput}.${this.member}`,
    };
  }

  override getLabel(): string {
    return `Get ${this.member.toUpperCase()}`;
  }

  member: string;
}
