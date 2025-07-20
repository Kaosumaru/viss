import type { ParameterValue, ParameterValueType } from "@graph/parameter";
import type { Context, Expression, Variable } from "../context";
import { scalar, type Type } from "@glsl/types";
import type { CompilationOptions } from "@compiler/compiler";

export type ParamExtractedValue<T> = Extract<
  ParameterValue,
  { type: T }
>["value"];

export interface NodeContext {
  getVariables(): Variable[];
  createVariable(outputData: Expression): Expression;
  info(): string;
  options(): CompilationOptions;
  tryGetInput(name: string): Expression | undefined;
  tryGetParamValue<T extends ParameterValueType>(
    name: string,
    type: T
  ): ParamExtractedValue<T> | undefined;
}

export interface Pin {
  name: string;
  type: Type;
}

export type Pins = Pin[];

export interface Parameter {
  name: string;
  type: ParameterValueType;
  defaultValue?: ParameterValue;
}

export interface OutputExpression {
  data: string;
  type?: Type;
  trivial?: boolean;
}

export type Parameters = Parameter[];
export abstract class CompilerNode {
  inputs: Pins = [];
  parameters: Parameters = [];
  outputs: Pins = [];
  abstract compile(node: NodeContext): Context;
  abstract getLabel(): string;

  protected addInput(name: string, type: Type): void {
    this.inputs.push({ name, type });
  }

  protected addOutput(name: string, type: Type): void {
    this.outputs.push({ name, type });
  }

  protected getInputType(name: string): Type | undefined {
    const pin = this.inputs.find((pin) => pin.name === name);
    return pin?.type;
  }

  protected getOutputType(name: string): Type | undefined {
    const pin = this.outputs.find((pin) => pin.name === name);
    return pin?.type;
  }

  protected createOutput(
    node: NodeContext,
    expression: string | OutputExpression
  ): Context {
    if (this.outputs.length !== 1) {
      throw new Error("Single output expected but multiple outputs found.");
    }
    const outputName = this.outputs[0].name;
    if (typeof expression === "object") {
      return this.createOutputs(node, [expression]);
    }
    const type = this.getOutputType(this.outputs[0].name);

    let outExpression: Expression = {
      data: expression,
      type: type!,
      trivial: false,
    };
    outExpression = this.toVariable(node, outExpression);

    return {
      variables: node.getVariables(),
      outputs: {
        [outputName]: outExpression,
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
    if (this.outputs.length !== outputs.length) {
      throw new Error("Mismatch between outputs and expected outputs.");
    }
    let i = 0;
    for (const { data, type, trivial } of outputs) {
      const output = this.outputs[i];
      i++;

      let outExpression: Expression = {
        type: type ?? output.type,
        data,
        trivial: trivial ?? false,
      };
      outExpression = this.toVariable(node, outExpression);

      result.outputs[output.name] = outExpression;
    }
    return result;
  }

  protected addParameter(
    name: string,
    type: ParameterValueType,
    defaultValue?: ParameterValue
  ): void {
    this.parameters.push({ name, type, defaultValue });
  }

  protected getParameter(name: string): Parameter | undefined {
    return this.parameters.find((param) => param.name === name);
  }

  protected addFloat(name: string): void {
    this.addInput(name, scalar("float"));
    this.addParameter(name, "number", { type: "number", value: 0 });
  }

  protected getInput(node: NodeContext, name: string): Expression {
    const input = node.tryGetInput(name);
    // TODO check type
    if (input) {
      return input;
    }
    throw new Error(`Input '${name}' not found in node ${node.info()}`);
  }

  getParamValue(node: NodeContext, name: string, type: "number"): number {
    const value = node.tryGetParamValue(name, type);
    if (value === undefined) {
      throw new Error(`Parameter ${name} not found`);
    }
    return value;
  }

  protected getFloat(node: NodeContext, name: string): string {
    const input = node.tryGetInput(name);
    if (input) {
      if (input.type.id === "scalar" && input.type.type === "float") {
        return input.data;
      }
      throw new Error(`Input ${name} is not of type number`);
    }

    // TODO
    const value = node.tryGetParamValue(name, "number");
    if (value !== undefined) {
      return value.toLocaleString("en-GB", { minimumFractionDigits: 1 });
    }
    throw new Error(`Input or parameter ${name} not found`);
  }

  protected toVariable(node: NodeContext, outputData: Expression): Expression {
    if (outputData.trivial || node.options().noVariables) {
      return outputData;
    }
    return node.createVariable(outputData);
  }
}
