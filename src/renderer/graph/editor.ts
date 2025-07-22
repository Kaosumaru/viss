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
} from "./nodes/customBooleanControl";

import { loadGraph as internalLoadGraph } from "./utils/loadGraph";
import { saveGraph as internalSaveGraph } from "./utils/saveGraph";
import { CompilationHelper } from "./utils/compileGraph";

export type OnGraphChanged = (editorData: EditorData) => void;

export async function createEditor(
  container: HTMLElement,
  onChanged?: OnGraphChanged,
): Promise<EditorData> {
  let deserializing = false;
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
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
      compilationHelper.updateGraph(data);
      onChanged(data);
      timer = undefined;
    });
  };

  // Function to add a node at the mouse position
  const createNode = async (
    nodeType: NodeType,
    x?: number,
    y?: number,
    id?: string
  ) => {
    const node = new UICompilerNode(
      nodeType);
    node.id = id || node.id; // Use provided ID or generate a new one
    // Set the control change callback for the node if it doesn't already have one
    node.setControlChangeCallback(() => {
      scheduleGraphChange();
    });

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

  const loadGraph = async (graphJson: string) => {
    deserializing = true; // Set the flag to skip onChanged during deserialization
    try {
      await internalLoadGraph(graphJson, data!);
    } finally {
      deserializing = false; // Reset the flag after loading
    }
  };

  const saveGraph = () => {
    return internalSaveGraph(data!);
  };

  const compileNode = (nodeId?: string): string | undefined => {
    return compilationHelper.compileNode(nodeId);
  };


  await createNode("preview");
  await arrange.layout();
  AreaExtensions.zoomAt(area, editor.getNodes());

  data = {
    destroy: () => area.destroy(),
    createNode,
    clear,
  
    loadGraph,
    saveGraph,

    compileNode,

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
      if (deserializing) {
        return context; // Skip during deserialization
      }
      scheduleGraphChange();
    }
    return context;
  });

  return data;
}
