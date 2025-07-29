import { Any, scalar, variant, variantGeneric, type Type } from "@glsl/types/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { canBeImplicitlyConverted } from "@glsl/types/implicitConversion";

export interface TemplateType {
  id: "template";
  name: string;
  constraint?: Type;
}

export interface TemplateComponentType {
  id: "templateComponent";
  name: string;
}

export function templateComponent(name: string): TemplateComponentType {
  return {
    id: "templateComponent",
    name,
  };
}

export function template(constraint?: Type, name: string = "T"): TemplateType {
  return {
    id: "template",
    name,
    constraint,
  };
}

export const genFType = template(variantGeneric("float"), "F");
export const genDType = template(variantGeneric("double"), "D");
export const genFDType = template(variant([variantGeneric("float"), variantGeneric("double")]), "FD");
export const genFIDType = template(variant([variantGeneric("float"), variantGeneric("int"), variantGeneric("double")]), "FID");
export const genFDComponent = templateComponent("FD");

type Param = [string, Type | TemplateType | TemplateComponentType];

export interface Signature {
    outType: Type | TemplateType | TemplateComponentType;
    params: Param[];
}

export function signature(
  outType: Type | TemplateType | TemplateComponentType,
  params: Param[]
): Signature {
  return {
    outType,
    params,
  };
}

export class FunctionNode extends CompilerNode {
  constructor(
    name: string,
    description: string,
    signature: Signature
  ) {
    super();
    this.name = name;
    this.outType = signature.outType;
    this.params = signature.params;
    this.description = description;
    for (const [name, type] of signature.params) {
      if (type.id === "template") {
        this.addInput(name, type.constraint ?? Any);
        continue;
      }
      if (type.id === "templateComponent") {
        // TODO we could add constraint here
        this.addInput(name, Any);
        continue;
      }
      this.addInput(name, type);
    }

    if (signature.outType.id === "template" || signature.outType.id === "templateComponent") {
      this.addOutput("out", Any);
    } else {
      this.addOutput("out", signature.outType);
    }
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
    if (this.outType.id === "templateComponent") {
      let resolvedType = resolver.getResolvedType(this.outType.name);
      if (resolvedType.id === "vector") {
        resolvedType = scalar(resolvedType.type);
      }
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

  outType: Type | TemplateType | TemplateComponentType;
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
