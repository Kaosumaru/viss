import { type Type } from "@glsl/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

type Param = [string, Type];

export class FunctionNode extends CompilerNode {
  constructor(name: string, outType: Type, params: Param[]) {
    super();
    this.name = name;
    for (const [name, type] of params) {
      this.addInput(name, type);
    }
    this.addOutput("out", outType);
    this.params = params;
  }

  override compile(node: NodeContext): Context {
    const inputs = this.params.map(
      ([name]) => this.getInput(node, name).mainOutput
    );

    return this.createSingleOutput(node, `${this.name}(${inputs.join(", ")})`);
  }

  override getLabel(): string {
    return this.name;
  }

  params: Param[];
  name: string;
}
