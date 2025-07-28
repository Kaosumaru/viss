import { type Type } from "@glsl/types/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";

type Param = [string, Type];

export class FunctionNode extends CompilerNode {
  constructor(name: string, description: string,  outType: Type, params: Param[]) {
    super();
    this.name = name;
    this.description = description;
    for (const [name, type] of params) {
      this.addInput(name, type);
    }
    this.addOutput("out", outType);
    this.params = params;
  }

  override compile(node: NodeContext): Context {
    const inputs = this.params.map(([name]) => this.getInput(node, name).data);

    return this.createOutput(node, `${this.name}(${inputs.join(", ")})`);
  }

  override getLabel(): string {
    return this.name;
  }

  override getDescription(): string {
    return this.description;
  }

  params: Param[];
  name: string;
  description: string;
}
