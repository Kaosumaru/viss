import type { Type } from "@glsl/types/types";
import type { ParameterValue } from "./parameter";

export interface Uniform {
  id: string;
  type: Type;
  defaultValue?: ParameterValue;
}

export type Uniforms = Record<string, Uniform>;
