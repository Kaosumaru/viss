import { memo } from "react";
import { ClassicPreset } from "rete";

export class PreviewControl extends ClassicPreset.Control {
  nodeId: string;

  constructor(nodeId: string) {
    super();
    this.nodeId = nodeId;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CustomPreviewControlInternal(_props: { data: PreviewControl }) {
  // render small black square
  return (
    <div
      style={{
        width: "100px",
        height: "100px",
        backgroundColor: "white",
        borderRadius: "2px",
      }}
    />
  );
}

export const CustomPreviewControl = memo(CustomPreviewControlInternal);
