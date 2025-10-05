import { type Type } from "@glsl/types/types";
import {
  CompilerNode,
  type NodeContext,
  type NodeInfo,
} from "../../compilerNode";
import type { Context } from "@compiler/context";
import { TemplatesResolver, type TemplateParameter } from "./templateResolver";
import type { ConstraintInfo } from "./constraintInfo";
import { variantToFirstType } from "@glsl/types/variantToFirstType";
import { defaultExpressionForType } from "@glsl/types/defaultExpressionForType";

interface ParamOptions {
  output?: boolean;
}

type Param = [string, Type | TemplateParameter, ParamOptions?];

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

interface ParamPin {
  name: string;
  type: Type;
  output: boolean;
}

export class FunctionNode extends CompilerNode {
  constructor(name: string, description: string, signature: Signature) {
    super();
    this.name = name;
    this.outType = signature.outType;
    this.functionParams = signature.params;
    this.templates = signature.templates;
    this.description = description;

    this.fillDefaultInputs();
  }

  override compile(node: NodeContext): Context {
    const [resolvedOutType, resolvedInputs] = this.resolveTemplates(node);
    const inputs = resolvedInputs.map(({ name, type, output }): string => {
      if (output) {
        const expression = defaultExpressionForType(type);
        const v = node.createVariable(expression);
        return v.data;
      }
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

  protected resolveTemplates(node: NodeContext): [Type, ParamPin[]] {
    const resolver = new TemplatesResolver();

    for (const [name, type] of Object.entries(this.templates)) {
      resolver.addTemplate(name, type);
    }

    // try to resolve type based on connected inputs
    for (const [name, type, opts] of this.functionParams) {
      const options = opts ?? {};
      if (options.output) {
        continue;
      }

      const template = resolver.isTemplate(type);
      if (template) {
        const input = node.tryGetInput(name);
        if (input) {
          resolver.resolve(template, input.type);
        }
      }
    }

    const inputPins: ParamPin[] = [];

    // determine current types of inputs based on already connected ones
    for (const [name, paramType, opts] of this.functionParams) {
      const options = opts ?? {};
      const type = resolver.resolveType(paramType);
      inputPins.push({
        name,
        type: options.output ? variantToFirstType(type) : type,
        output: options.output ?? false,
      });
    }

    const outType = resolver.resolveType(this.outType);
    return [variantToFirstType(outType), inputPins];
  }

  override getInfo(node: NodeContext): NodeInfo {
    const [resolvedOutType, inputs] = this.resolveTemplates(node);

    return {
      name: this.name,
      description: this.description,
      showPreview: this.showPreview(),
      inputs: inputs.filter((pin) => !pin.output),
      outputs: [
        ...inputs.filter((pin) => pin.output),
        { name: "out", type: resolvedOutType },
      ],
      parameters: [],
    };
  }

  private fillDefaultInputs() {
    const resolver = new TemplatesResolver();

    for (const [name, type] of Object.entries(this.templates)) {
      resolver.addTemplate(name, type);
    }
    for (const param of this.functionParams) {
      const [name, paramType] = param;
      const type = resolver.resolveType(paramType);
      this.addInput(name, type);
    }
  }

  outType: Type | TemplateParameter;
  templates: Record<string, ConstraintInfo>;
  functionParams: Param[];
  name: string;
  description: string;
}
