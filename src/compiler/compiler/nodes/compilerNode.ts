import type { ParameterValue, ParameterValueType } from "@graph/parameter";
import type { Context } from "../context";
import type { Type } from "@glsl/types";

export type ParamExtractedValue<T> = Extract<
  ParameterValue,
  { type: T }
>["value"];

export interface NodeContext {
  getInput(name: string): Context;
  hasInput(name: string): boolean;
  tryGetInput(name: string): Context | undefined;
  getParamValue<T extends ParameterValueType>(
    name: string,
    type: T
  ): ParamExtractedValue<T>;
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
}
