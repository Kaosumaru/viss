import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
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
  NumberControl,
  CustomNumberControl,
} from "./nodes/controls/customNumberControl";
import {
  PreviewControl,
  CustomPreviewControl,
} from "./nodes/controls/customPreviewControl";
import { CustomConnection } from "./nodes/customConnection";
import { CustomSocket } from "./nodes/customSocket";
import { Node } from "./nodes/customNode";
import { ShaderEntryProvider } from "../components/shaderOverlay/ShaderEntryProvider";

// Create a dark theme for Material-UI
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

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
            React.createElement(ThemeProvider, {
              theme: darkTheme,
              children: [
                React.createElement(CssBaseline, { key: "css-baseline" }),
                React.createElement(ShaderEntryProvider, {
                  key: "shader-provider",
                  context: overlayContext,
                  children: element,
                }),
              ],
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
          if (data.payload instanceof NumberControl) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return CustomNumberControl as any;
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
