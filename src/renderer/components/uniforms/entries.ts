import type { ParameterValue } from "@graph/parameter";
import type { UniformVisualizer, UniformVisualizerId } from "@graph/uniform";
import { type UniformItemProps } from "./UniformItem";
import FloatUniformItem from "./FloatUniformItem";
import Vec2UniformItem from "./Vec2UniformItem";
import Vec3UniformItem from "./Vec3UniformItem";
import Vec4UniformItem from "./Vec4UniformItem";
import BoolUniformItem from "./BoolUniformItem";
import { sampler2D, scalar, vector, type Type } from "@glsl/types/types";
import TextureUniformItem from "./TextureUniformItem";

interface UniformVisualizerEntry {
  name: string;
  type: Type;
  visualizer: UniformVisualizer;
  defaultValue?: ParameterValue;
}

export const uniformVisualizers: UniformVisualizerEntry[] = [
  {
    name: "Float",
    visualizer: { id: "float" },
    type: scalar("float"),
    defaultValue: {
      type: "number",
      value: 0.0,
    },
  },
  {
    name: "Vec2",
    visualizer: { id: "vec2" },
    type: vector("float", 2),
    defaultValue: {
      type: "vector",
      value: [0.0, 0.0],
    },
  },
  {
    name: "Vec3",
    visualizer: { id: "vec3" },
    type: vector("float", 3),
    defaultValue: {
      type: "vector",
      value: [0.0, 0.0, 0.0],
    },
  },
  {
    name: "Vec4",
    visualizer: { id: "vec4" },
    type: vector("float", 4),
    defaultValue: {
      type: "vector",
      value: [0.0, 0.0, 0.0, 0.0],
    },
  },
  {
    name: "Texture",
    visualizer: { id: "texture" },
    type: sampler2D(),
    defaultValue: {
      type: "string",
      value: "",
    },
  },
];

export const uniformComponents: Record<
  UniformVisualizerId,
  React.FC<UniformItemProps>
> = {
  float: FloatUniformItem,
  vec2: Vec2UniformItem,
  vec3: Vec3UniformItem,
  vec4: Vec4UniformItem,
  bool: BoolUniformItem,
  texture: TextureUniformItem,
};
