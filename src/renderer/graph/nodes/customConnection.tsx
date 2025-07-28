import { Presets as ReactPresets } from "rete-react-plugin";
import { css } from "styled-components";
import type { Schemes } from "../node";
import { getTypeColor } from "./typeColor";

interface CustomConnectionProps {
  data: Schemes["Connection"];
}

export function CustomConnection(props: CustomConnectionProps) {
  const color = getTypeColor(props.data.type);
  return (
    <ReactPresets.classic.Connection
      {...props}
      styles={() => css`
        opacity: 0.6;
        stroke-width: 0.3em;
        stroke: ${color};
      `}
    />
  );
}
