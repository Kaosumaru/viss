import { useRete } from "rete-react-plugin";
import { createEditor, type OnGraphChanged } from "./graph/editor";
import { useCallback, useRef, useState } from "react";
import { MaterialContextMenuProvider } from "./components/contextMenu/materialContextMenuProvider";
import { UICompilerNode } from "./graph/nodes/compilerNode";
import type { EditorAPI } from "./graph/interface";
import { ShaderOverlayRenderer } from "./components/shaderOverlay/ShaderOverlayRenderer";
import type { ShaderEntry } from "./components/shaderOverlay/shaderEntry";
import type { MenuItem } from "./components/contextMenu/interface";
import type { Parameters } from "@graph/parameter";
import {
  NodeSelectionArea,
  getNodesInSelectionArea,
} from "./components/selectionArea";
import type { SelectionRect } from "./components/selectionArea";

export interface EditorViewProps {
  onChanged?: OnGraphChanged;
}

export function EditorView({ onChanged }: EditorViewProps) {
  const editorRef = useRef<EditorAPI | null>(null);

  const [lastContextMenuPosition, setLastContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [entries, setEntries] = useState<ShaderEntry[]>([]);

  const addEntry = useCallback((entry: ShaderEntry) => {
    setEntries((prev) => [...prev, entry]);
  }, []);

  const removeEntry = useCallback((entry: ShaderEntry) => {
    setEntries((prev) => prev.filter((e) => e !== entry));
  }, []);

  const updateEntryPosition = useCallback(
    (entry: ShaderEntry, x: number, y: number, w: number, h: number) => {
      entry.setPosition(x, y, w, h);
    },
    []
  );

  const updateEntryShader = useCallback(
    (entry: ShaderEntry, fragment: string) => {
      entry.setShader(fragment);
    },
    []
  );

  const create = useCallback(
    async (container: HTMLElement) => {
      const editor = await createEditor(
        container,
        {
          addEntry,
          removeEntry,
          updateEntryPosition,
          updateEntryShader,
        },
        onChanged
      );
      editorRef.current = editor;
      onChanged?.(editor);
      return editor;
    },
    [addEntry, onChanged, removeEntry, updateEntryPosition, updateEntryShader]
  );

  const [ref] = useRete(create);

  const handleNodeCreate = useCallback(
    async (item: MenuItem) => {
      const node = item.nodeType;
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

      let params: Parameters | undefined;

      if (item.identifierParam) {
        params = {
          _identifier: {
            type: "string",
            value: item.identifierParam,
          },
        };
      }

      editorRef.current.createNode(
        node,
        "screen",
        positionX,
        positionY,
        params
      );
    },
    [lastContextMenuPosition, ref]
  );

  const handleNodeDelete = useCallback((nodeId: string) => {
    editorRef.current?.deleteNode(nodeId);
  }, []);

  const getCustomFunctions = useCallback(() => {
    return editorRef.current?.getCustomFunctions() || [];
  }, []);

  const getNodeById = useCallback(
    (nodeId: string): UICompilerNode | undefined => {
      return editorRef.current?.getNode(nodeId);
    },
    []
  );

  const handleNodeSelection = useCallback((nodeIds: string[]) => {
    if (editorRef.current) {
      editorRef.current.selectNodes(nodeIds);
    }
  }, []);

  const getNodesInArea = useCallback(
    (rect: SelectionRect): string[] => {
      if (!ref.current) return [];
      return getNodesInSelectionArea(rect, ref.current);
    },
    [ref]
  );

  const contextMenuProvider = (
    <MaterialContextMenuProvider
      onNodeCreate={handleNodeCreate}
      onNodeDelete={handleNodeDelete}
      onContextMenuOpen={setLastContextMenuPosition}
      getNodeById={getNodeById}
      customFunctions={getCustomFunctions()}
    >
      <ShaderOverlayRenderer entries={entries} />
      <NodeSelectionArea
        onNodeSelection={handleNodeSelection}
        getNodesInArea={getNodesInArea}
      >
        <div ref={ref} style={{ height: "100vh" }} />
      </NodeSelectionArea>
    </MaterialContextMenuProvider>
  );

  return contextMenuProvider;
}
