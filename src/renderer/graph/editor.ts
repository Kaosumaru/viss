import { NodeEditor } from "rete";
import { AreaPlugin, AreaExtensions, Drag } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "./extensions/connection";
import {
  AutoArrangePlugin,
  Presets as ArrangePresets,
} from "rete-auto-arrange-plugin";
import type { AreaExtra, Schemes } from "./node";
import { addCustomBackground } from "./nodes/customBackground";
import type { EditorAPI } from "./interface";
import { EditorAPIImp } from "./editorAPIImpl";
import { createRenderer } from "./renderer";

import {
  accumulateOnCtrl,
  selectableNodes,
  selector,
  type SelectableAPI,
} from "./extensions/selectable";
import { ShaderRenderer } from "@renderer/components/shaderOverlay/shaderRenderer";
import emitter from "./emitter";
import type { Position } from "@graph/position";

export type OnGraphChanged = (editorData: EditorAPI) => void;

export function createEditor(
  container: HTMLElement,
  shaderRenderer: ShaderRenderer,
  onChanged?: OnGraphChanged
): Promise<EditorAPI> {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const selectable: SelectableAPI = selectableNodes(area, selector(), {
    accumulating: accumulateOnCtrl(),
  });

  const editorData = new EditorAPIImp(editor, area, selectable, onChanged);

  editorData.addUniformCallback(shaderRenderer);

  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = createRenderer(shaderRenderer);
  const arrange = new AutoArrangePlugin<Schemes>();

  addCustomBackground(area);
  connection.addPreset(ConnectionPresets.classic.setup());

  arrange.addPreset(ArrangePresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);
  area.use(arrange);

  area.area.setDragHandler(
    new Drag({
      down: (e) => {
        if (e.pointerType === "mouse" && e.button !== 2) return false;

        return true;
      },
      move: () => true,
    })
  );

  // AreaExtensions.simpleNodesOrder(area); TODO breaks the boolean control
  AreaExtensions.showInputControl<Schemes>(area, ({ hasAnyConnection }) => {
    return !hasAnyConnection;
  });

  connection.addPipe(async (context) => {
    if (context.type === "connectiondrop") {
      const d = context.data;
      if (!d.created) {
        const defaultPosition: Position = { x: 0, y: 0 };
        await emitter.emit("connectionDroppedOnEmpty", {
          from: { nodeId: d.initial.nodeId, socketId: d.initial.key },
          position: d.position ?? defaultPosition,
        });
      }
    }
    return context;
  });

  // disable zoom on double click
  area.addPipe((context) => {
    if (context.type === "zoom" && context.data.source === "dblclick") return;
    return context;
  });

  // await editorData.createNode("output", "screen");
  //void AreaExtensions.zoomAt(area, editor.getNodes());

  return Promise.resolve(editorData);
}
