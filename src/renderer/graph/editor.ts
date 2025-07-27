import { NodeEditor } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import {
  AutoArrangePlugin,
  Presets as ArrangePresets,
} from "rete-auto-arrange-plugin";
import type { AreaExtra, Schemes } from "./node";
import { addCustomBackground } from "./nodes/customBackground";
import type { EditorAPI } from "./interface";

import type { ShaderEntryContextType } from "renderer/components/shaderOverlay/ShaderEntryContext";
import { EditorAPIImp } from "./editorAPIImpl";
import { createRenderer } from "./renderer";

import { selectableNodes, type SelectableAPI } from "./extensions/selectable";

export type OnGraphChanged = (editorData: EditorAPI) => void;

export async function createEditor(
  container: HTMLElement,
  overlayContext: ShaderEntryContextType,
  onChanged?: OnGraphChanged
): Promise<EditorAPI> {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = createRenderer(overlayContext);
  const arrange = new AutoArrangePlugin<Schemes>();
  const selectable: SelectableAPI = selectableNodes(
    area,
    AreaExtensions.selector(),
    {
      accumulating: AreaExtensions.accumulateOnCtrl(),
    }
  );

  const editorData = new EditorAPIImp(editor, area, selectable, onChanged);

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

  await editorData.createNode("output", "screen");
  AreaExtensions.zoomAt(area, editor.getNodes());

  return editorData;
}
