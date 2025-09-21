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

interface Vec2UniformVisualizer {
  id: "vec2";
}

interface Vec3UniformVisualizer {
  id: "vec3";
}

interface Vec4UniformVisualizer {
  id: "vec4";
}

interface BoolUniformVisualizer {
  id: "bool";
}

interface TextureVisualizer {
  id: "texture";
}

export type UniformVisualizer =
  | FloatUniformVisualizer
  | Vec2UniformVisualizer
  | Vec3UniformVisualizer
  | Vec4UniformVisualizer
  | BoolUniformVisualizer
  | TextureVisualizer;

export type UniformVisualizerId = UniformVisualizer["id"];
