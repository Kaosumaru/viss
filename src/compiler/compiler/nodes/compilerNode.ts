import type { ParameterValue, ParameterValueType } from "@graph/parameter";
import type { Context } from "../context";
import { scalar, type Type } from "@glsl/types";

export type ParamExtractedValue<T> = Extract<
  ParameterValue,
  { type: T }
>["value"];

export interface NodeContext {
  tryGetInput(name: string): Context | undefined;
  tryGetParamValue<T extends ParameterValueType>(
    name: string,
    type: T
  ): ParamExtractedValue<T> | undefined;
}

export interface Pins {
  [key: string]: Type;
}

export interface ParameterInfo {
  type: ParameterValueType;
  defaultValue?: ParameterValue;
}

export interface Parameters {
  [key: string]: ParameterInfo;
}
export abstract class CompilerNode {
  inputs: Pins = {};
  parameters: Parameters = {};
  outputs: Pins = {};
  abstract compile(node: NodeContext): Context;
  abstract getLabel(): string;

  protected addFloat(name: string): void {
    this.inputs[name] = scalar("float");
    this.parameters[name] = {
      type: "number",
      defaultValue: { type: "number", value: 0 },
    };
  }

  protected getInput(node: NodeContext, name: string): Context {
    const input = node.tryGetInput(name);
    // TODO check type
    if (input) {
      return input;
    }
    throw new Error(`Input ${name} not found`);
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
