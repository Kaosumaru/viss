import { type Type } from "@glsl/types/types";
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
      const template = resolver.isTemplate(type);
      if (template) {
        const input = node.tryGetInput(name);
        if (input) {
          resolver.resolve(template, input.type);
        }
      }
    }

    const inputPins: Pins = [];

    // determine current types of inputs based on already connected ones
    for (const [name, paramType] of this.functionParams) {
      inputPins.push({ name, type: resolver.resolveType(paramType) });
    }

    const outType = resolver.resolveType(this.outType);
    return [variantToFirstType(outType), inputPins];
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
