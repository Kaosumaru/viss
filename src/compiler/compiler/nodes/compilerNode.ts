import type { ParameterValue, ParameterValueType } from "@graph/parameter";
import type { Context } from "../context";
import type { Type } from "@glsl/types";

export type ParamExtractedValue<T> = Extract<
  ParameterValue,
  { type: T }
>["value"];

export interface NodeContext {
  getInput(name: string): Context;
  getParam<T extends ParameterValueType>(
    name: string,
    type: T
  ): ParamExtractedValue<T>;
}

export interface Pins {
  [key: string]: Type;
}

export interface Parameters {
  [key: string]: ParameterValueType;
}
export abstract class CompilerNode {
  inputs: Pins = {};
  parameters: Parameters = {};
  outputs: Pins = {};
  abstract compile(ctx: Context, node: NodeContext): Context;
}
