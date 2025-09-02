import React from "react";
import type { ReactNode } from "react";
import { EditorContext } from "./EditorContext";
import type { EditorAPI } from "@renderer/graph/interface";

interface EditorProviderProps {
  children: ReactNode;
  editor: EditorAPI | undefined;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({
  children,
  editor,
}) => {
  return (
    <EditorContext.Provider value={{ editor }}>
      {children}
    </EditorContext.Provider>
  );
};
