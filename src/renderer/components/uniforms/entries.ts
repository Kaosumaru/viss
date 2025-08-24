import type { ParameterValue } from "@graph/parameter";
import type { UniformVisualizer, UniformVisualizerId } from "@graph/uniform";
import { type UniformItemProps } from "./UniformItem";
import FloatUniformItem from "./FloatUniformItem";
import { scalar, type Type } from "@glsl/types/types";

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
];

export const uniformComponents: Record<
  UniformVisualizerId,
  React.FC<UniformItemProps>
> = {
  float: FloatUniformItem,
  // Add other components here
};
