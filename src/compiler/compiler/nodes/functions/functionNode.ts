import { Any, type Type } from "@glsl/types/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { canBeImplicitlyConverted } from "@glsl/types/implicitConversion";

export interface TemplateType {
  id: "template";
  name: string;
  constraint?: Type;
}

export function template(constraint?: Type, name: string = "T"): TemplateType {
  return {
    id: "template",
    name,
    constraint,
  };
}

type Param = [string, Type | TemplateType];

export class FunctionNode extends CompilerNode {
  constructor(
    name: string,
    description: string,
    outType: Type | TemplateType,
    params: Param[]
  ) {
    super();
    this.name = name;
    this.outType = outType;
    this.description = description;
    for (const [name, type] of params) {
      if (type.id === "template") {
        this.addInput(name, Any);
        continue;
      }
      this.addInput(name, type);
    }

    if (outType.id === "template") {
      this.addOutput("out", Any);
    } else {
      this.addOutput("out", outType);
    }

    this.params = params;
  }

  override compile(node: NodeContext): Context {
    const resolver = new TemplatesResolver();
    for (const [name, type] of this.params) {
      if (type.id === "template") {
        resolver.resolve(type, this.getInput(node, name).type);
      }
    }

    const inputs = this.params.map(([name]) => this.getInput(node, name).data);

    const callExpression = `${this.name}(${inputs.join(", ")})`;

    if (this.outType.id === "template") {
      const resolvedType = resolver.getResolvedType(this.outType.name);
      return this.createOutput(node, {
        type: resolvedType,
        data: callExpression,
      });
    }
    return this.createOutput(node, callExpression);
  }

  override getLabel(): string {
    return this.name;
  }

  override getDescription(): string {
    return this.description;
  }

  outType: Type | TemplateType;
  params: Param[];
  name: string;
  description: string;
}

class TemplatesResolver {
  private resolved: Map<string, Type> = new Map();

  resolve(template: TemplateType, inputType: Type): Type {
    // TODO resolver should find a common type for the template
    const result = this.resolved.get(template.name);
    if (!result) {
      this.resolved.set(template.name, inputType);
      return inputType;
    }

    if (canBeImplicitlyConverted(inputType, result)) {
      return result;
    }
    throw new Error(
      `Cannot resolve template type ${template.name} with input type ${inputType.id}`
    );
  }

  getResolvedType(name: string): Type {
    const type = this.resolved.get(name);
    if (!type) {
      throw new Error(`Template type ${name} is not resolved`);
    }
    return type;
  }
}
