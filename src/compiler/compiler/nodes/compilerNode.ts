import type {
  Color,
  ParameterValue,
  ParameterValueType,
} from "@graph/parameter";
import type { Context, Expression, Variable } from "../context";
import { scalar, type Type } from "@glsl/types/types";
import type { CompilationOptions } from "@compiler/compiler";
import type { FunctionDefinition } from "@glsl/function";
import type { Parameters as GraphParameters } from "@graph/parameter";
import { toFloat, toVec4 } from "@glsl/utils";
import { defaultExpressionForType } from "@glsl/types/defaultExpressionForType";
import type { ScalarTypeName } from "@glsl/types/typenames";
import type { Uniform } from "@graph/uniform";

/*
export type ParamExtractedValue<T> = Extract<
  ParameterValue,
  { type: T }
>["value"];
*/

export type ParamExtractedValue<T extends ParameterValueType> =
  T extends "number"
    ? number
    : T extends "boolean"
    ? boolean
    : T extends "color"
    ? Color
    : never;

export interface NodeContext {
  tryGetFunctionDefinition(name: string): FunctionDefinition | undefined;
  getVariables(): Variable[];
  createVariable(outputData: Expression): Expression;
  info(): string;
  options(): CompilationOptions;
  tryGetInput(name: string): Expression | undefined;
  tryGetUniform(name: string): Uniform | undefined;
  tryGetParamValue<T extends ParameterValueType>(
    name: string,
    type: T
  ): ParamExtractedValue<T> | undefined;
}

export interface Pin {
  name: string;
  type: Type;
}

export interface InputPin extends Pin {
  defaultValue?: Expression;
}

export type Pins = Pin[];
export type InputPins = InputPin[];

export interface Parameter {
  name: string;
  description?: string;
  type: ParameterValueType;
  defaultValue?: ParameterValue;
}

export interface OutputExpression {
  name?: string;
  data: string;
  type: Type;
  trivial?: boolean;
}

export interface NodeInfo {
  name: string;
  description: string;
  showPreview?: boolean;
  inputs: Pins;
  outputs: Pins;
  parameters: Parameters;
  errorMessage?: string;
}

export type Parameters = Parameter[];
export abstract class CompilerNode {
  private inputs_: InputPins = [];
  private parameters_: Parameters = [];
  abstract compile(node: NodeContext): Context;
  abstract getLabel(): string;
  abstract getDescription(): string;

  showPreview(): boolean {
    return false;
  }

  public getInfo(_node: NodeContext, compiledContext: Context): NodeInfo {
    return {
      name: this.getLabel(),
      description: this.getDescription(),
      showPreview: this.showPreview(),
      inputs: this.inputs_,
      outputs: Object.entries(compiledContext.outputs).map(([key, output]) => ({
        name: key,
        type: output.type,
      })),
      parameters: this.parameters_,
    };
  }

  public canImplicitlyCastInput() {
    return false;
  }

  protected addInput(
    name: string,
    type: Type,
    defaultValue?: Expression
  ): void {
    this.inputs_.push({ name, type, defaultValue });
  }

  protected getInputType(name: string): Type | undefined {
    const pin = this.inputs_.find((pin) => pin.name === name);
    return pin?.type;
  }

  protected createOutput(
    node: NodeContext,
    expression: OutputExpression
  ): Context {
    let outExpression: Expression = {
      data: expression.data,
      type: expression.type,
      trivial: expression.trivial ?? false,
    };
    outExpression = this.toVariable(node, outExpression);
    const name = expression.name ?? "out"; // Default output name

    return {
      variables: node.getVariables(),
      outputs: {
        [name]: outExpression,
      },
    };
  }

  protected createOutputs(
    node: NodeContext,
    outputs: OutputExpression[]
  ): Context {
    const result: Context = {
      variables: node.getVariables(),
      outputs: {},
    };

    for (const expression of outputs) {
      let outExpression: Expression = {
        data: expression.data,
        type: expression.type,
        trivial: expression.trivial ?? false,
      };
      outExpression = this.toVariable(node, outExpression);
      const name = expression.name ?? "out"; // Default output name

      if (name in result.outputs) {
        throw new Error(`Output '${name}' already exists`);
      }

      result.outputs[name] = outExpression;
    }
    return result;
  }

  protected createDynamicOutputs(
    node: NodeContext,
    outputs: [string, OutputExpression][]
  ): Context {
    const result: Context = {
      variables: node.getVariables(),
      outputs: {},
    };

    for (const [name, { data, type, trivial }] of outputs) {
      if (!type) {
        throw new Error(`Output type for '${name}' is not defined`);
      }

      let outExpression: Expression = {
        type: type,
        data,
        trivial: trivial ?? false,
      };
      outExpression = this.toVariable(node, outExpression);

      result.outputs[name] = outExpression;
    }
    return result;
  }

  protected addParameter(
    name: string,
    type: ParameterValueType,
    defaultValue?: ParameterValue,
    description?: string
  ): void {
    this.parameters_.push({ name, type, defaultValue, description });
  }

  protected getParameter(name: string): Parameter | undefined {
    return this.parameters_.find((param) => param.name === name);
  }

  protected addInputWithParam(name: string, type: ScalarTypeName): void {
    switch (type) {
      case "float":
        this.addInput(name, scalar(type));
        this.addParameter(name, "number", { type: "number", value: 0 });
        return;
      case "bool":
        this.addInput(name, scalar(type));
        this.addParameter(name, "boolean", { type: "boolean", value: false });
        return;
    }
    throw new Error(`Unsupported type: ${type}`);
  }

  protected getInput(node: NodeContext, name: string): Expression {
    const input = node.tryGetInput(name);
    // TODO check type
    if (input) {
      return input;
    }
    const inputPin = this.getInputPin(name);
    if (inputPin) {
      if (inputPin.defaultValue) {
        return inputPin.defaultValue;
      }
      return defaultExpressionForType(inputPin.type);
    }
    throw new Error(`Input '${name}' not found in node ${node.info()}`);
  }

  protected getInputPin(name: string): InputPin | undefined {
    return this.inputs_.find((input) => input.name === name);
  }

  getDefaultParameters(): GraphParameters {
    const params: GraphParameters = {};
    for (const param of this.parameters_) {
      if (param.defaultValue !== undefined) {
        params[param.name] = param.defaultValue;
      }
    }
    return params;
  }

  getParamValue(node: NodeContext, name: string, type: "number"): number;
  getParamValue(node: NodeContext, name: string, type: "boolean"): boolean;
  getParamValue(node: NodeContext, name: string, type: "color"): Color;
  getParamValue(
    node: NodeContext,
    name: string,
    type: ParameterValueType
  ): ParamExtractedValue<ParameterValueType> {
    const value = node.tryGetParamValue(name, type);
    if (value === undefined) {
      throw new Error(`Parameter ${name} not found`);
    }
    return value;
  }

  protected getInputOrParam(
    node: NodeContext,
    name: string,
    type: ScalarTypeName
  ): string {
    const input = node.tryGetInput(name);
    if (input) {
      if (input.type.id === "scalar" && input.type.type === "float") {
        return input.data;
      }
      throw new Error(`Input ${name} is not of type number`);
    }

    const value = node.tryGetParamValue(name, this.scalarToParamType(type));
    if (value !== undefined) {
      return this.paramToGlsl(value, this.scalarToParamType(type));
    }
    throw new Error(`Input or parameter ${name} not found`);
  }

  protected scalarToParamType(type: ScalarTypeName): ParameterValueType {
    switch (type) {
      case "float":
        return "number";
      case "bool":
        return "boolean";
    }
    throw new Error(`Unsupported type: ${type}`);
  }

  protected paramToGlsl(
    value: ParamExtractedValue<ParameterValueType>,
    type: ParameterValueType
  ): string {
    switch (type) {
      case "number":
        return toFloat(value as number);
      case "boolean":
        return (value as boolean) ? "true" : "false";
      case "color":
        return toVec4(value as Color);
    }
    throw new Error(`Unsupported parameter type: ${type}`);
  }

  protected toVariable(node: NodeContext, outputData: Expression): Expression {
    if (outputData.trivial || node.options().noVariables) {
      return outputData;
    }
    return node.createVariable(outputData);
  }
}
