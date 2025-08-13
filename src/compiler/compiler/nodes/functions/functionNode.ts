import {
  scalar,
  variant,
  variantScalarVector,
  type Type,
} from "@glsl/types/types";
import { CompilerNode, type NodeContext } from "../compilerNode";
import type { Context } from "@compiler/context";
import { canBeImplicitlyConverted } from "@glsl/types/implicitConversion";
import type { ScalarTypeName } from "@glsl/types/typenames";

export interface TemplateType {
  id: "template";
  name: string;
  constraint: Type;
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

export function template(constraint: Type, name: string = "T"): TemplateType {
  return {
    id: "template",
    name,
    constraint,
  };
}

export const genFType = template(variantScalarVector("float"), "F");
export const genDType = template(variantScalarVector("double"), "D");
export const genFDType = template(
  variant([variantScalarVector("float"), variantScalarVector("double")]),
  "FD"
);
export const genFIDType = template(
  variant([
    variantScalarVector("float"),
    variantScalarVector("int"),
    variantScalarVector("double"),
  ]),
  "FID"
);
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
  constructor(name: string, description: string, signature: Signature) {
    super();
    this.name = name;
    this.outType = signature.outType;
    this.params = signature.params;
    this.description = description;

    const resolver = new TemplatesResolver();
    for (const [name, type] of signature.params) {
      if (type.id === "template") {
        this.addInput(name, type.constraint);
        resolver.addTemplate(type.name, type);
        continue;
      }
      if (type.id === "templateComponent") {
        this.addInput(name, resolver.resolveComponent(type.name));
        continue;
      }
      this.addInput(name, type);
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
      return this.createOutput(node, {
        type: resolver.getResolvedType(this.outType.name),
        data: callExpression,
      });
    }
    if (this.outType.id === "templateComponent") {
      return this.createOutput(node, {
        type: resolver.getResolvedComponentType(this.outType.name),
        data: callExpression,
      });
    }

    return this.createOutput(node, {
      type: this.outType,
      data: callExpression,
    });
  }

  override getLabel(): string {
    return this.name;
  }

  override getDescription(): string {
    return this.description;
  }

  public override canImplicitlyCastInput() {
    return false;
  }

  outType: Type | TemplateType | TemplateComponentType;
  params: Param[];
  name: string;
  description: string;
}

class TemplatesResolver {
  private resolved: Map<string, Type> = new Map();
  private constraints: Map<string, Type> = new Map();

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

  resolveComponent(name: string): Type {
    const constraint = this.constraints.get(name);
    if (!constraint) {
      throw new Error(`Template component ${name} is not defined`);
    }
    return this.templateConstraintToComponentConstraint(constraint);
  }

  addTemplate(name: string, type: TemplateType) {
    this.constraints.set(name, type.constraint);
  }

  getResolvedType(name: string): Type {
    const type = this.resolved.get(name);
    if (!type) {
      throw new Error(`Template type ${name} is not resolved`);
    }
    return type;
  }

  getResolvedComponentType(name: string): Type {
    const resolvedType = this.getResolvedType(name);
    if (resolvedType.id === "vector") {
      return scalar(resolvedType.type);
    }
    return resolvedType;
  }

  protected templateConstraintToComponentConstraint(type: Type) {
    if (type.id === "variant") {
      const scalars = new Set<ScalarTypeName>();
      for (const subType of type.types) {
        switch (subType.id) {
          case "scalar":
          case "vector":
            scalars.add(subType.type);
            break;
          default:
            throw new Error(`Unsupported type in variant: ${subType.id}`);
        }
      }

      return variant(
        Array.from(scalars).map((scalarType) => scalar(scalarType))
      );
    }
    return type;
  }
}
