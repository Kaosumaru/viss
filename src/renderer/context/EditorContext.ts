import type { EditorAPI } from "@renderer/graph/interface";
import { createContext } from "react";

interface EditorContextType {
  editor: EditorAPI | undefined;
}

export const EditorContext = createContext<EditorContextType>({
  editor: undefined,
});
