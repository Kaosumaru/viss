import type { Type } from "@glsl/types/types";
import type { ParameterValue } from "./parameter";

export interface Uniform {
  id: string;
  type: Type;
  defaultValue?: ParameterValue;
  visualizer?: UniformVisualizer;
}

export type Uniforms = Record<string, Uniform>;

interface FloatUniformVisualizer {
  id: "float";
}

export type UniformVisualizer = FloatUniformVisualizer;
export type UniformVisualizerId = UniformVisualizer["id"];
