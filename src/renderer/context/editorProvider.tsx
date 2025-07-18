import React from "react";
import type { ReactNode } from "react";
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { Schemes, AreaExtra } from "../graph/node";
import { EditorContext } from "./EditorContext";

interface EditorProviderProps {
  children: ReactNode;
  editor: NodeEditor<Schemes> | null;
  area: AreaPlugin<Schemes, AreaExtra> | null;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({
  children,
  editor,
  area,
}) => {
  return (
    <EditorContext.Provider value={{ editor, area }}>
      {children}
    </EditorContext.Provider>
  );
};
