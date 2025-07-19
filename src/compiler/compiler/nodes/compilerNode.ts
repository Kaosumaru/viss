import type { ParameterValue, ParameterValueType } from "@graph/parameter";
import type { Context, OutputData } from "../context";
import { scalar, type Type } from "@glsl/types";

export type ParamExtractedValue<T> = Extract<
  ParameterValue,
  { type: T }
>["value"];

export interface NodeContext {
  info(): string;
  tryGetInput(name: string): OutputData | undefined;
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

type OutputText = [string] | [string, Type];

export type Parameters = Parameter[];
export abstract class CompilerNode {
  inputs: Pins = [];
  parameters: Parameters = [];
  outputs: Pins = [];
  abstract compile(node: NodeContext): Context;
  abstract getLabel(): string;

  // a node is trivial if it doesn't make sense to cache it's value
  // e.g. a node that just returns a constant value
  isTrivial(): boolean {
    return false;
  }

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
    _node: NodeContext,
    output: string,
    type?: Type
  ): Context {
    if (this.outputs.length !== 1) {
      throw new Error("Single output expected but multiple outputs found.");
    }
    const outputName = this.outputs[0].name;
    if (!type) {
      type = this.getOutputType(this.outputs[0].name);
    }
    return {
      outputs: {
        [outputName]: {
          type: type!,
          mainOutput: output,
        },
      },
    };
  }

  protected createOutputs(_node: NodeContext, outputs: OutputText[]): Context {
    const result: Context = {
      outputs: {},
    };
    if (this.outputs.length !== outputs.length) {
      throw new Error("Mismatch between outputs and expected outputs.");
    }
    let i = 0;
    for (const [outputText, type] of outputs) {
      const output = this.outputs[i];
      i++;
      result.outputs[output.name] = {
        type: type ?? output.type,
        mainOutput: outputText,
      };
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

  protected getInput(node: NodeContext, name: string): OutputData {
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
        return input.mainOutput;
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
}
