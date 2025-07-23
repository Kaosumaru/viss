import { createRoot } from "react-dom/client";
import { ClassicPreset, NodeEditor } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { ReactPlugin, Presets } from "rete-react-plugin";
import {
  AutoArrangePlugin,
  Presets as ArrangePresets,
} from "rete-auto-arrange-plugin";
import React from "react";
import { ShaderEntryProvider } from "../components/shaderOverlay/ShaderEntryProvider";
import type { AreaExtra, Schemes } from "./node";
import { UICompilerNode } from "./nodes/compilerNode";
import { Node } from "./nodes/customNode";
import { addCustomBackground } from "./nodes/customBackground";
import { CustomSocket } from "./nodes/customSocket";
import { CustomConnection } from "./nodes/customConnection";
import { getDOMSocketPosition } from "rete-render-utils";
import type { NodeType } from "@compiler/nodes/allNodes";
import type { EditorData } from "./interface";
import {
  BooleanControl,
  CustomBooleanControl,
} from "./nodes/controls/customBooleanControl";

import { loadGraph as internalLoadGraph } from "./utils/loadGraph";
import { saveGraph as internalSaveGraph } from "./utils/saveGraph";
import { CompilationHelper } from "./utils/compileGraph";
import {
  CustomPreviewControl,
  PreviewControl,
} from "./nodes/controls/customPreviewControl";
import type { ShaderEntryContextType } from "renderer/components/shaderOverlay/ShaderEntryContext";

export type OnGraphChanged = (editorData: EditorData) => void;

export async function createEditor(
  container: HTMLElement,
  overlayContext: ShaderEntryContextType,
  onChanged?: OnGraphChanged
): Promise<EditorData> {
  let deserializing = false;
  const nodeToPreviewControl = new Map<string, PreviewControl>();
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
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
  const arrange = new AutoArrangePlugin<Schemes>();

  const compilationHelper = new CompilationHelper();
  // const contextMenu = createContextMenu();

  // area.use(contextMenu);

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  // Disable the built-in context menu to use our custom Material UI one
  // render.addPreset(Presets.contextMenu.setup());

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

  addCustomBackground(area);
  connection.addPreset(ConnectionPresets.classic.setup());

  arrange.addPreset(ArrangePresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);
  area.use(arrange);

  // AreaExtensions.simpleNodesOrder(area); TODO breaks the boolean control
  AreaExtensions.showInputControl<Schemes>(area, ({ hasAnyConnection }) => {
    return !hasAnyConnection;
  });

  let data: EditorData | undefined = undefined;

  let timer: ReturnType<typeof setTimeout> | undefined;
  const scheduleGraphChange = () => {
    if (timer) return;

    timer = setTimeout(() => {
      if (!data || !onChanged) return;
      compilationHelper.updateGraph(editor, area);
      onChanged(data);

      for (const [node, control] of nodeToPreviewControl) {
        control.shader = compilationHelper.compileNode(node);
        area.update("control", control.id);
      }
      timer = undefined;
    });
  };

  // Function to add a node at the mouse position
  const createNode = async (
    nodeType: NodeType,
    space: "screen" | "absolute" = "screen",
    x?: number,
    y?: number,
    id?: string
  ) => {
    const node = new UICompilerNode(nodeType);
    node.id = id || node.id; // Use provided ID or generate a new one

    if (node.previewControl) {
      nodeToPreviewControl.set(node.id, node.previewControl);
    }
    // Set the control change callback for the node if it doesn't already have one
    node.setControlChangeCallback(() => {
      scheduleGraphChange();
    });

    await editor.addNode(node);

    if (x !== undefined && y !== undefined) {
      // Convert screen coordinates to area coordinates
      const transform = area.area.transform;

      if (space === "screen") {
        x = (x - transform.x) / transform.k;
        y = (y - transform.y) / transform.k;
      }

      await area.translate(node.id, { x, y });
    }

    return node;
  };

  const deleteNode = async (nodeId: string) => {
    const connectionsToRemove = editor
      .getConnections()
      .filter(
        (connection) =>
          connection.source === nodeId || connection.target === nodeId
      );

    // Remove all connections involving this node
    for (const connection of connectionsToRemove) {
      await editor.removeConnection(connection.id);
    }

    // Finally remove the node itself
    await editor.removeNode(nodeId);
  };

  const clear = async () => {
    nodeToPreviewControl.clear();
    await editor.clear();
  };

  const loadGraph = async (graphJson: string) => {
    deserializing = true; // Set the flag to skip onChanged during deserialization
    try {
      await clear();
      await internalLoadGraph(graphJson, data!, editor);
      AreaExtensions.zoomAt(area, editor.getNodes());
      scheduleGraphChange();
    } finally {
      deserializing = false; // Reset the flag after loading
    }
  };

  const saveGraph = () => {
    return internalSaveGraph(editor, area);
  };

  const getNode = (nodeId: string): UICompilerNode | undefined => {
    const node = editor.getNode(nodeId);
    return node instanceof UICompilerNode ? node : undefined;
  };

  const compileNode = (nodeId?: string): string | undefined => {
    return compilationHelper.compileNode(nodeId);
  };

  await createNode("output");
  //await arrange.layout();
  AreaExtensions.zoomAt(area, editor.getNodes());

  data = {
    destroy: () => area.destroy(),
    createNode,
    deleteNode,
    clear,

    getNode,

    loadGraph,
    saveGraph,

    compileNode,
  };

  editor.addPipe((context) => {
    if (context.type === "noderemoved") {
      nodeToPreviewControl.delete(context.data.id);
    }
    if (
      context.type === "nodecreated" ||
      context.type === "noderemoved" ||
      context.type === "connectioncreated" ||
      context.type === "connectionremoved"
    ) {
      if (deserializing) {
        return context; // Skip during deserialization
      }
      scheduleGraphChange();
    }
    return context;
  });

  return data;
}
