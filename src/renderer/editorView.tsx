import { useRete } from "rete-react-plugin";
import {
  createEditor,
  type OnGraphChanged,
  type OnControlChanged,
} from "./editor";
import { useCallback, useRef, useState } from "react";
import { MaterialContextMenuProvider } from "./components/contextMenu/materialContextMenuProvider";
import { UICompilerNode } from "./graph/nodes/compilerNode";
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { Schemes, AreaExtra } from "./graph/node";
import type { NodeType } from "@compiler/nodes/allNodes";
import { ShaderOverlay } from "./components/shaderOverlay/ShaderOverlay";

export interface EditorViewProps {
  onChanged?: OnGraphChanged;
  onControlChanged?: OnControlChanged;
}

export interface EditorData {
  destroy: () => void;
  clear: () => void;
  createNode: (
    nodeType: NodeType,
    x?: number,
    y?: number,
    id?: string
  ) => Promise<UICompilerNode>;
  editor: NodeEditor<Schemes>;
  area: AreaPlugin<Schemes, AreaExtra>;
}

export function EditorView({ onChanged, onControlChanged }: EditorViewProps) {
  const editorRef = useRef<EditorData | null>(null);

  const [lastContextMenuPosition, setLastContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const create = useCallback(
    async (container: HTMLElement) => {
      const editor = await createEditor(container, onChanged, onControlChanged);
      editorRef.current = editor;
      onChanged?.(editor);
      return editor;
    },
    [onChanged, onControlChanged]
  );

  const [ref] = useRete(create);

  const handleNodeCreate = useCallback(
    (node: NodeType) => {
      let positionX = 200;
      let positionY = 200;

      if (!editorRef.current || !ref.current) return;
      const container = ref.current as HTMLElement;

      if (lastContextMenuPosition) {
        // Convert screen coordinates to area coordinates relative to the container
        const rect = container.getBoundingClientRect();
        positionX = lastContextMenuPosition.x - rect.left;
        positionY = lastContextMenuPosition.y - rect.top;
      } else {
        const rect = container.getBoundingClientRect();
        positionX = rect.width / 2;
        positionY = rect.height / 2;
      }

      editorRef.current.createNode(node, positionX, positionY);
    },
    [lastContextMenuPosition, ref]
  );

  const handleNodeDelete = useCallback((nodeId: string) => {
    if (editorRef.current) {
      removeNodeWithConnections(editorRef.current.editor, nodeId);
    }
  }, []);

  const getNodeById = useCallback(
    (nodeId: string): UICompilerNode | undefined => {
      if (editorRef.current) {
        const node = editorRef.current.editor.getNode(nodeId);
        return node instanceof UICompilerNode ? node : undefined;
      }
      return undefined;
    },
    []
  );

  const contextMenuProvider = (
    <MaterialContextMenuProvider
      onNodeCreate={handleNodeCreate}
      onNodeDelete={handleNodeDelete}
      onContextMenuOpen={setLastContextMenuPosition}
      getNodeById={getNodeById}
    >
      <div ref={ref} style={{ height: "100vh" }} />
      <ShaderOverlay/>
    </MaterialContextMenuProvider>
  );

  return contextMenuProvider;
}

function removeNodeWithConnections(
  editor: NodeEditor<Schemes>,
  nodeId: string
) {
  // Get all connections that involve this node
  const connectionsToRemove = editor
    .getConnections()
    .filter(
      (connection) =>
        connection.source === nodeId || connection.target === nodeId
    );

  // Remove all connections involving this node
  for (const connection of connectionsToRemove) {
    editor.removeConnection(connection.id);
  }

  // Finally remove the node itself
  editor.removeNode(nodeId);
}
