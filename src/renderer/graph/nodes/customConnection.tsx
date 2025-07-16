import { Presets as ReactPresets } from "rete-react-plugin";
import { css } from "styled-components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomConnection(props: any) {
  return (
    <ReactPresets.classic.Connection
      {...props}
      styles={() => css`
        opacity: 0.6;
        stroke-width: 0.3em;
        stroke: #faff0080;
      `}
    />
  );
}
