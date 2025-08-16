import { componentType } from "@glsl/types/componentType";
import type { ScalarTypeName } from "@glsl/types/typenames";
import { type Type, scalar, variant } from "@glsl/types/types";
import {
  constrainScalarType,
  constraintToComponentType,
  constraintToType,
  constrainType,
  type ConstraintInfo,
} from "./constraintInfo";

export interface TemplateType {
  id: "template";
  templateName: string;
}

export interface TemplateComponentType {
  id: "templateComponent";
  templateName: string;
}

export function templateComponent(name: string = "T"): TemplateComponentType {
  return {
    id: "templateComponent",
    templateName: name,
  };
}

export function template(name: string = "T"): TemplateType {
  return {
    id: "template",
    templateName: name,
  };
}

type TemplateParameter = TemplateType | TemplateComponentType;

interface TemplateInfo {
  constraint: ConstraintInfo;
}

export class TemplatesResolver {
  private templates: Map<string, TemplateInfo> = new Map();

  resolve(template: TemplateParameter, inputType: Type) {
    const result = this.templates.get(template.templateName);
    if (!result) {
      throw new Error(`Template ${template.templateName} is not defined`);
    }

    switch (template.id) {
      case "template": {
        result.constraint = constrainScalarType(
          result.constraint,
          componentType(inputType)
        );
        result.constraint = constrainType(result.constraint, inputType);
        break;
      }
      case "templateComponent":
        result.constraint = constrainScalarType(
          result.constraint,
          componentType(inputType)
        );
    }
  }

  addTemplate(name: string, constraint: ConstraintInfo) {
    this.templates.set(name, { constraint });
  }

  getResolvedType(name: string): Type {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template ${name} is not defined`);
    }
    return constraintToType(template.constraint);
  }

  getResolvedComponentType(name: string): Type {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template ${name} is not defined`);
    }
    return constraintToComponentType(template.constraint);
  }

  protected templateConstraintToComponentConstraint(type: Type) {
    if (type.id === "variant") {
      const scalars = new Set<ScalarTypeName>();
      for (const subType of type.types) {
        scalars.add(componentType(subType));
      }

      return variant(Array.from(scalars).map(scalar));
    }
    return type;
  }
}
