import { createContext } from "react";
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { Schemes, AreaExtra } from "../graph/node";

interface EditorContextType {
  editor: NodeEditor<Schemes> | null;
  area: AreaPlugin<Schemes, AreaExtra> | null;
}

export const EditorContext = createContext<EditorContextType>({
  editor: null,
  area: null,
});
