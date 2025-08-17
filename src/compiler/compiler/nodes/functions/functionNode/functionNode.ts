import { variant, type Type } from "@glsl/types/types";
import {
  CompilerNode,
  type NodeContext,
  type NodeInfo,
  type Pins,
} from "../../compilerNode";
import type { Context } from "@compiler/context";
import { TemplatesResolver, type TemplateParameter } from "./templateResolver";
import type { ConstraintInfo } from "./constraintInfo";
import { variantToFirstType } from "@glsl/types/variantToFirstType";
import { defaultExpressionForType } from "@glsl/types/defaultExpressionForType";

type Param = [string, Type | TemplateParameter];

export interface Signature {
  outType: Type | TemplateParameter;
  params: Param[];
  templates: Record<string, ConstraintInfo>;
}

export function signature(
  outType: Type | TemplateParameter,
  params: Param[],
  template?: ConstraintInfo
): Signature {
  return {
    outType,
    params,
    templates: template
      ? {
          T: template,
        }
      : {},
  };
}

export class FunctionNode extends CompilerNode {
  constructor(name: string, description: string, signature: Signature) {
    super();
    this.name = name;
    this.outType = signature.outType;
    this.functionParams = signature.params;
    this.templates = signature.templates;
    this.description = description;
  }

  override compile(node: NodeContext): Context {
    const [resolvedOutType, resolvedInputs] = this.resolveTemplates(node);
    const inputs = resolvedInputs.map(({ name, type }): string => {
      const input = node.tryGetInput(name);
      if (input) {
        return input.data;
      }
      return defaultExpressionForType(type).data;
    });

    return this.createOutput(node, {
      type: resolvedOutType,
      data: `${this.name}(${inputs.join(", ")})`,
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

  protected resolveTemplates(node: NodeContext): [Type, Pins] {
    const resolver = new TemplatesResolver();

    for (const [name, type] of Object.entries(this.templates)) {
      resolver.addTemplate(name, type);
    }

    // try to resolve type based on connected inputs
    for (const [name, type] of this.functionParams) {
      if (
        type.id === "template" ||
        type.id === "templateComponent" ||
        type.id === "templateOrComponent"
      ) {
        const input = node.tryGetInput(name);
        if (input) {
          resolver.resolve(type, input.type);
        }
      }
    }

    const inputPins: Pins = [];

    // determine current types of inputs based on already connected ones
    for (const [name, paramType] of this.functionParams) {
      if (paramType.id === "template") {
        const type = resolver.getResolvedType(paramType.templateName);
        inputPins.push({
          name,
          type,
        });
      } else if (paramType.id === "templateComponent") {
        const type = resolver.getResolvedComponentType(paramType.templateName);
        inputPins.push({
          name,
          type,
        });
      } else if (paramType.id === "templateOrComponent") {
        const type1 = resolver.getResolvedType(paramType.templateName);
        const type2 = resolver.getResolvedComponentType(paramType.templateName);
        inputPins.push({
          name,
          type: type1.id === "scalar" ? type1 : variant([type1, type2]),
        });
      } else {
        inputPins.push({ name, type: paramType });
      }
    }

    // return output type and input pins
    if (this.outType.id === "template") {
      return [
        variantToFirstType(resolver.getResolvedType(this.outType.templateName)),
        inputPins,
      ];
    }

    if (this.outType.id === "templateComponent") {
      return [
        variantToFirstType(
          resolver.getResolvedComponentType(this.outType.templateName)
        ),
        inputPins,
      ];
    }

    if (this.outType.id === "templateOrComponent") {
      throw new Error(
        `Template or component type ${this.outType.templateName} cannot be an output`
      );
    }

    return [this.outType, inputPins];
  }

  override getInfo(node: NodeContext): NodeInfo {
    const [resolvedOutType, inputs] = this.resolveTemplates(node);

    return {
      name: this.name,
      description: this.description,
      showPreview: true,
      inputs,
      outputs: [{ name: "out", type: resolvedOutType }],
      parameters: [],
    };
  }

  outType: Type | TemplateParameter;
  templates: Record<string, ConstraintInfo>;
  functionParams: Param[];
  name: string;
  description: string;
}
