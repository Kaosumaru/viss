import type { ParameterValue } from "@graph/parameter";
import type { UniformVisualizer, UniformVisualizerId } from "@graph/uniform";
import { type UniformItemProps } from "./UniformItem";
import FloatUniformItem from "./FloatUniformItem";
import { sampler2D, scalar, type Type } from "@glsl/types/types";
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
  texture: TextureUniformItem,
  // Add other components here
};
