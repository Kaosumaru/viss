import { typeToName } from "@glsl/types/typeToString";
import type { Uniform } from "@graph/uniform";
import React from "react";

interface UniformDisplayProps {
  name: string;
  uniform: Uniform;
}

export const UniformDisplay: React.FC<UniformDisplayProps> = ({
  name,
  uniform,
}) => {
  return (
    <span>
      {name} <span style={{ color: "#aaa" }}>({typeToName(uniform.type)})</span>
    </span>
  );
};
