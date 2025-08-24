import type { ParameterValue } from "@graph/parameter";
import type { UniformVisualizer } from "@graph/uniform";

interface UniformVisualizerEntry {
  name: string;
  visualizer: UniformVisualizer;
  defaultValue?: ParameterValue;
}

export const uniformVisualizers: UniformVisualizerEntry[] = [
  {
    name: "Float",
    visualizer: {
      id: "scalar",
    },
    defaultValue: {
      type: "number",
      value: 0.0,
    },
  },
];
