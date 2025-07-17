import { useRete } from "rete-react-plugin";
import { createEditor, type OnGraphChanged } from "./editor";
import { useCallback, useRef, useState } from "react";
import { MaterialContextMenuProvider } from "./components/materialContextMenuProvider";
import { UICompilerNode } from "./graph/nodes/compilerNode";
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { Schemes, AreaExtra } from "./graph/node";

export interface EditorViewProps {
  onChanged?: OnGraphChanged;
}

export function EditorView({ onChanged }: EditorViewProps) {
  const editorRef = useRef<{
    destroy: () => void;
    addNode: (
      node: UICompilerNode,
      x?: number,
      y?: number
    ) => Promise<UICompilerNode>;
    editor: NodeEditor<Schemes>;
    area: AreaPlugin<Schemes, AreaExtra>;
  } | null>(null);

  const [lastContextMenuPosition, setLastContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const create = useCallback(
    async (container: HTMLElement) => {
      const editor = await createEditor(container, onChanged);
      editorRef.current = editor;
      return editor;
    },
    [onChanged]
  );

  const [ref] = useRete(create);

  const handleNodeCreate = useCallback(
    (node: UICompilerNode) => {
      if (editorRef.current && lastContextMenuPosition) {
        // Convert screen coordinates to area coordinates relative to the container
        const container = ref.current as HTMLElement | null;
        if (container) {
          const rect = container.getBoundingClientRect();
          const relativeX = lastContextMenuPosition.x - rect.left;
          const relativeY = lastContextMenuPosition.y - rect.top;
          editorRef.current.addNode(node, relativeX, relativeY);
        } else {
          editorRef.current.addNode(node, 200, 200);
        }
      } else if (editorRef.current) {
        // Fallback to center position
        editorRef.current.addNode(node, 200, 200);
      }
    },
    [lastContextMenuPosition, ref]
  );

  const contextMenuProvider = (
    <MaterialContextMenuProvider
      onNodeCreate={handleNodeCreate}
      onContextMenuOpen={setLastContextMenuPosition}
    >
      <div ref={ref} style={{ height: "100vh" }} />
    </MaterialContextMenuProvider>
  );

  return contextMenuProvider;
}
