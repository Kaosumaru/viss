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
import type { AreaExtra, Schemes } from "./graph/node";
import { UICompilerNode } from "./graph/nodes/compilerNode";
import { Node } from "./graph/nodes/customNode";
import { addCustomBackground } from "./graph/nodes/customBackground";
import { CustomSocket } from "./graph/nodes/customSocket";
import { CustomConnection } from "./graph/nodes/customConnection";
import { getDOMSocketPosition } from "rete-render-utils";
import type { NodeType } from "@compiler/nodes/allNodes";
import type { EditorData } from "./editorView";
import {
  BooleanControl,
  CustomBooleanControl,
} from "./graph/nodes/customBooleanControl";

export type OnGraphChanged = (editorData: EditorData) => void;

export type OnControlChanged = (
  editorData: EditorData,
  nodeId: string,
  controlKey: string,
  value: unknown
) => void;

export async function createEditor(
  container: HTMLElement,
  onChanged?: OnGraphChanged,
  onControlChanged?: OnControlChanged
): Promise<EditorData> {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
  const arrange = new AutoArrangePlugin<Schemes>();
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

  AreaExtensions.simpleNodesOrder(area);
  AreaExtensions.showInputControl<Schemes>(area, ({ hasAnyConnection }) => {
    return !hasAnyConnection;
  });

  let data: EditorData | undefined = undefined;

  // Function to add a node at the mouse position
  const createNode = async (
    nodeType: NodeType,
    x?: number,
    y?: number,
    id?: string
  ) => {
    const node = new UICompilerNode(
      nodeType,
      onControlChanged
        ? (nodeId, controlKey, value) => {
            onControlChanged(data!, nodeId, controlKey, value);
          }
        : undefined
    );
    node.id = id || node.id; // Use provided ID or generate a new one
    // Set the control change callback for the node if it doesn't already have one
    if (onControlChanged && node.setControlChangeCallback) {
      node.setControlChangeCallback((nodeId, controlKey, value) => {
        onControlChanged(data!, nodeId, controlKey, value);
      });
    }

    await editor.addNode(node);

    if (x !== undefined && y !== undefined) {
      // Convert screen coordinates to area coordinates
      const transform = area.area.transform;
      const areaX = (x - transform.x) / transform.k;
      const areaY = (y - transform.y) / transform.k;

      await area.translate(node.id, { x: areaX, y: areaY });
    }

    return node;
  };

  const clear = () => {
    editor.clear();
  };

  await createNode("preview");
  await arrange.layout();
  AreaExtensions.zoomAt(area, editor.getNodes());

  data = {
    destroy: () => area.destroy(),
    createNode,
    clear,
    editor,
    area,
  };

  editor.addPipe((context) => {
    if (
      context.type === "nodecreated" ||
      context.type === "noderemoved" ||
      context.type === "connectioncreated" ||
      context.type === "connectionremoved"
    ) {
      onChanged?.(data);
    }
    return context;
  });

  return data;
}
