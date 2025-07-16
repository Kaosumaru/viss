import type { Type } from "@glsl/types";
import { CompilerNode } from "../compilerNode";
import type { Context } from "@compiler/context";

export class UniformNode extends CompilerNode {
  constructor(uniformName: string, type: Type) {
    super();
    this.uniformName = uniformName;
    this.type = type;
    this.addOutput("out", type);
  }
  override compile(): Context {
    return {
      type: this.type,
      mainOutput: this.uniformName,
    };
  }

  override getLabel(): string {
    return this.uniformName;
  }

  uniformName: string;
  type: Type;
}
