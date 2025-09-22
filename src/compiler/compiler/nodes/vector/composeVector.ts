import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import type { ScalarTypeName } from "@glsl/types/typenames";
import { vector, type VectorType } from "@glsl/types/types";
import { typeToGlsl } from "@glsl/types/typeToString";

export class ComposeVector extends CompilerNode {
  constructor(type: ScalarTypeName, size: number) {
    super();

    this.type = vector(type, size);
    this.typename = typeToGlsl(this.type);

    for (let i = 0; i < this.type.size; i++) {
      this.addInputWithParam(components[i] ?? "<NO-INDEX>", this.type.type);
    }
  }

  override compile(node: NodeContext): Context {
    const data: string[] = [];
    for (let i = 0; i < this.type.size; i++) {
      data.push(
        this.getInputOrParam(
          node,
          components[i] ?? "<NO-INDEX>",
          this.type.type
        )
      );
    }

    return this.createOutput(node, {
      type: this.type,
      data: `${this.typename}(${data.join(", ")})`,
    });
  }

  override getLabel(): string {
    return this.typename;
  }

  override getDescription(): string {
    return `Compose a ${this.typename}`;
  }

  private typename: string;
  private type: VectorType;
}

const components = ["x", "y", "z", "w"];
