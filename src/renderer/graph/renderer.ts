import React from "react";
import { createRoot } from "react-dom/client";
import type { ShaderEntryContextType } from "renderer/components/shaderOverlay/ShaderEntryContext";
import { ClassicPreset } from "rete";
import { ReactPlugin, Presets } from "rete-react-plugin";
import { getDOMSocketPosition } from "rete-render-utils";
import type { Schemes, AreaExtra } from "./node";
import {
  BooleanControl,
  CustomBooleanControl,
} from "./nodes/controls/customBooleanControl";
import {
  ColorControl,
  CustomColorControl,
} from "./nodes/controls/color/customColorControl";
import {
  PreviewControl,
  CustomPreviewControl,
} from "./nodes/controls/customPreviewControl";
import { CustomConnection } from "./nodes/customConnection";
import { CustomSocket } from "./nodes/customSocket";
import { Node } from "./nodes/customNode";
import { ShaderEntryProvider } from "../components/shaderOverlay/ShaderEntryProvider";

export function createRenderer(
  overlayContext: ShaderEntryContextType
): ReactPlugin<Schemes, AreaExtra> {
  const render = new ReactPlugin<Schemes, AreaExtra>({
    createRoot: (container) => {
      const root = createRoot(container);

      // Wrap the rendering with ShaderEntryProvider context
      return {
        render: (element: React.ReactElement) => {
          root.render(
            React.createElement(ShaderEntryProvider, {
              context: overlayContext,
              children: element,
            })
          );
        },
        unmount: () => root.unmount(),
      };
    },
  });

  render.addPreset(
    Presets.classic.setup({
      socketPositionWatcher: getDOMSocketPosition({
        offset({ x, y }, _nodeId, side) {
          return {
            x: x + 10 * (side === "input" ? -1 : 1),
            y: y,
          };
        },
      }),
      customize: {
        node() {
          return Node;
        },
        socket() {
          return CustomSocket;
        },
        connection() {
          return CustomConnection;
        },
        control(data) {
          if (data.payload instanceof BooleanControl) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return CustomBooleanControl as any;
          }
          if (data.payload instanceof ColorControl) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return CustomColorControl as any;
          }
          if (data.payload instanceof PreviewControl) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return CustomPreviewControl as any;
          }
          if (data.payload instanceof ClassicPreset.InputControl) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return Presets.classic.Control as any;
          }
          return null;
        },
      },
    })
  );

  return render;
}
