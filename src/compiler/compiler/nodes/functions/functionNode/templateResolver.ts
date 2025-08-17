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

export interface TemplateOrComponentType {
  id: "templateOrComponent";
  templateName: string;
}

export interface TemplateOrComponentOrBooleanType {
  id: "templateOrComponentOrBoolean";
  templateName: string;
}

export interface TemplateBooleanComponentType {
  id: "templateBooleanComponent";
  templateName: string;
}

export type TemplateParameter =
  | TemplateType
  | TemplateComponentType
  | TemplateOrComponentType
  | TemplateBooleanComponentType
  | TemplateOrComponentOrBooleanType;

export function templateComponent(name: string = "T"): TemplateComponentType {
  return {
    id: "templateComponent",
    templateName: name,
  };
}

export function templateBooleanComponent(
  name: string = "T"
): TemplateBooleanComponentType {
  return {
    id: "templateBooleanComponent",
    templateName: name,
  };
}

export function templateOrComponent(
  name: string = "T"
): TemplateOrComponentType {
  return {
    id: "templateOrComponent",
    templateName: name,
  };
}

export function templateOrComponentOrBoolean(
  name: string = "T"
): TemplateOrComponentOrBooleanType {
  return {
    id: "templateOrComponentOrBoolean",
    templateName: name,
  };
}

export function template(name: string = "T"): TemplateType {
  return {
    id: "template",
    templateName: name,
  };
}

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
        // min(x, y) - providing x resolves whole template type
        result.constraint = constrainScalarType(
          result.constraint,
          componentType(inputType)
        );
        result.constraint = constrainType(result.constraint, inputType);
        break;
      }
      case "templateComponent":
        // y = length(x) - y is scalar value of x (if vec2 is vec2, y is float)
        result.constraint = constrainScalarType(
          result.constraint,
          componentType(inputType)
        );
        break;
      case "templateOrComponent":
        // min(x, y) - providing y either resolves whole template type
        // of just gives information that x is uses float or double (can be float, double, vec2, etc)
        result.constraint = constrainScalarType(
          result.constraint,
          componentType(inputType)
        );
        if (inputType.id !== "scalar") {
          result.constraint = constrainType(result.constraint, inputType);
        }
        break;
      case "templateBooleanComponent":
        result.constraint = constrainType(result.constraint, inputType);
        break;
      case "templateOrComponentOrBoolean": {
        const cType = componentType(inputType);

        if (cType === "bool") {
          result.constraint = constrainType(result.constraint, inputType);
        } else {
          result.constraint = constrainScalarType(result.constraint, cType);
          if (inputType.id !== "scalar") {
            result.constraint = constrainType(result.constraint, inputType);
          }
        }
        break;
      }
    }
  }

  addTemplate(name: string, constraint: ConstraintInfo) {
    this.templates.set(name, { constraint });
  }

  isTemplate(
    inputType: Type | TemplateParameter
  ): TemplateParameter | undefined {
    switch (inputType.id) {
      case "template":
      case "templateComponent":
      case "templateOrComponent":
      case "templateBooleanComponent":
      case "templateOrComponentOrBoolean":
        return inputType;
    }
    return undefined;
  }

  resolveType(inputType: Type | TemplateParameter): Type {
    const template = this.isTemplate(inputType);
    if (!template) {
      return inputType as Type;
    }

    let constraint = this.getConstraint(template);
    if (inputType.id === "template") {
      return constraintToType(constraint);
    }

    if (inputType.id === "templateComponent") {
      return constraintToComponentType(constraint);
    }

    if (inputType.id === "templateOrComponent") {
      const type1 = constraintToType(constraint);
      const type2 = constraintToComponentType(constraint);
      return type1.id === "scalar" ? type1 : variant([type1, type2]);
    }

    if (inputType.id === "templateBooleanComponent") {
      constraint = { ...constraint, underlyingScalar: ["bool"] };
      return constraintToType(constraint);
    }

    if (inputType.id === "templateOrComponentOrBoolean") {
      constraint = {
        ...constraint,
        underlyingScalar: [...constraint.underlyingScalar, "bool"],
      };

      const type1 = constraintToType(constraint);
      const type2 = constraintToComponentType(constraint);
      return type1.id === "scalar" ? type1 : variant([type1, type2]);
    }

    return inputType;
  }

  protected getConstraint(param: TemplateParameter): ConstraintInfo {
    const template = this.templates.get(param.templateName);
    if (!template) {
      throw new Error(`Template ${param.templateName} is not defined`);
    }
    return template.constraint;
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
