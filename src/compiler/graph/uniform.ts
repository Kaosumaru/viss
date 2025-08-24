import type { Type } from "@glsl/types/types";
import type { ParameterValue } from "./parameter";

export interface Uniform {
  id: string;
  type: Type;
  defaultValue?: ParameterValue;
  visualizer?: UniformVisualizer;
}

export type Uniforms = Record<string, Uniform>;

interface ScalarUniformVisualizer {
  id: "scalar";
}

export type UniformVisualizer = ScalarUniformVisualizer;
