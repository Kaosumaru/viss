import { createRoot } from "react-dom/client";
import { NodeEditor } from "rete";
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
import { createContextMenu } from "./contextMenu";
import { UICompilerNode } from "./graph/nodes/compilerNode";
import { Node } from "./graph/nodes/customNode";
import { addCustomBackground } from "./graph/nodes/customBackground";
import { CustomSocket } from "./graph/nodes/customSocket";
import { CustomConnection } from "./graph/nodes/customConnection";
import { getDOMSocketPosition } from "rete-render-utils";

export type OnGraphChanged = (
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>
) => void;

export async function createEditor(
  container: HTMLElement,
  onChanged?: OnGraphChanged
) {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
  const arrange = new AutoArrangePlugin<Schemes>();
  const contextMenu = createContextMenu();

  area.use(contextMenu);

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(Presets.contextMenu.setup());
  //render.addPreset(Presets.classic.setup());

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

  editor.addPipe((context) => {
    if (
      context.type === "nodecreated" ||
      context.type === "noderemoved" ||
      context.type === "connectioncreated" ||
      context.type === "connectionremoved"
    ) {
      onChanged?.(editor, area);
    }
    return context;
  });

  AreaExtensions.simpleNodesOrder(area);
  AreaExtensions.showInputControl<Schemes>(area, ({ hasAnyConnection }) => {
    return !hasAnyConnection;
  });

  const previewNode = new UICompilerNode("preview");

  await editor.addNode(previewNode);

  await arrange.layout();
  AreaExtensions.zoomAt(area, editor.getNodes());

  return {
    destroy: () => area.destroy(),
  };
}
