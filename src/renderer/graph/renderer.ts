import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import type { ShaderEntryContextType } from "renderer/components/shaderOverlay/ShaderEntryContext";
import { ClassicPreset } from "rete";
import { ReactPlugin, Presets } from "rete-react-plugin";
import { getDOMSocketPosition } from "rete-render-utils";
import type { Schemes, AreaExtra } from "./node";
import { CustomBooleanControl } from "./nodes/controls/customBooleanControl";
import { CustomColorControl } from "./nodes/controls/color/customColorControl";
import { CustomNumberControl } from "./nodes/controls/customNumberControl";
import { CustomPreviewControl } from "./nodes/controls/customPreviewControl";
import { CustomConnection } from "./nodes/customConnection";
import { CustomSocket } from "./nodes/customSocket";
import { Node } from "./nodes/customNode";
import { ShaderEntryProvider } from "../components/shaderOverlay/ShaderEntryProvider";
import {
  BooleanControl,
  ColorControl,
  NumberControl,
  PreviewControl,
} from "./nodes/controls/customParamControl";

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
        unmount: () => {
          root.unmount();
        },
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
            // TODo why any is needed?
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
            return CustomBooleanControl as any;
          }
          if (data.payload instanceof ColorControl) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
            return CustomColorControl as any;
          }
          if (data.payload instanceof NumberControl) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
            return CustomNumberControl as any;
          }
          if (data.payload instanceof PreviewControl) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
            return CustomPreviewControl as any;
          }
          if (data.payload instanceof ClassicPreset.InputControl) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
            return Presets.classic.Control as any;
          }
          return null;
        },
      },
    })
  );

  return render;
}
