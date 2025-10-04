import { useRete, type Position } from "rete-react-plugin";
import { createEditor, type OnGraphChanged } from "./graph/editor";
import { useCallback, useEffect, useRef } from "react";
import { MaterialContextMenuProvider } from "./components/contextMenu/materialContextMenuProvider";
import { UICompilerNode } from "./graph/nodes/compilerNode";
import type { EditorAPI } from "./graph/interface";
import type { MenuItem } from "./components/contextMenu/interface";
import type { Parameters } from "@graph/parameter";
import {
  NodeSelectionArea,
  getNodesInSelectionArea,
} from "./components/selectionArea";
import type { SelectionRect } from "./components/selectionArea";
import { ShaderRenderer } from "./components/shaderOverlay/shaderRenderer";
import type { SocketRef } from "./graph/emitter";

export interface EditorViewProps {
  onChanged?: OnGraphChanged;
}

export function EditorView({ onChanged }: EditorViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shaderRendererRef = useRef<ShaderRenderer | null>(null);
  const editorRef = useRef<EditorAPI | null>(null);

  const create = useCallback(
    async (container: HTMLElement) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      shaderRendererRef.current = new ShaderRenderer(canvasRef.current!);

      const editor = await createEditor(
        container,
        shaderRendererRef.current,
        onChanged
      );
      editorRef.current = editor;
      onChanged?.(editor);
      return editor;
    },
    [onChanged]
  );

  const [ref] = useRete(create);

  // Cleanup EditorAPI when component unmounts
  useEffect(() => {
    return () => {
      if (shaderRendererRef.current) {
        shaderRendererRef.current.dispose();
        shaderRendererRef.current = null;
      }
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  const handleNodeCreate = useCallback(
    async (item: MenuItem, position: Position, socketRef?: SocketRef) => {
      const node = item.nodeType;
      let positionX = 200;
      let positionY = 200;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!editorRef.current || !ref.current) return;
      const container = ref.current as HTMLElement;

      const rect = container.getBoundingClientRect();
      positionX = position.x - rect.left;
      positionY = position.y - rect.top;

      let params: Parameters | undefined;

      if (item.identifierParam) {
        params = {
          _identifier: {
            type: "string",
            value: item.identifierParam,
          },
        };
      }

      await editorRef.current.createNode(
        node,
        "screen",
        positionX,
        positionY,
        params
      );
    },
    [ref]
  );

  const handleNodeDeleteFromContextMenu = useCallback((nodeId: string) => {
    if (!editorRef.current) return;
    if (!editorRef.current.isNodeSelected(nodeId)) {
      void editorRef.current.deleteNode(nodeId);
    } else {
      const selectedNodes = editorRef.current.getSelectedNodes();
      void editorRef.current.deleteNodes(selectedNodes);
    }
  }, []);

  const handleNodeTogglePreview = useCallback((nodeId: string) => {
    const node = editorRef.current?.getNode(nodeId);
    if (node) {
      node.togglePreview();
    }
  }, []);

  const getCustomFunctions = useCallback(() => {
    return editorRef.current?.getCustomFunctions() || [];
  }, []);

  const getUniforms = useCallback(() => {
    return editorRef.current?.uniforms() || {};
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
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!ref.current) return [];
      return getNodesInSelectionArea(rect, ref.current);
    },
    [ref]
  );

  const contextMenuProvider = (
    <MaterialContextMenuProvider
      onNodeCreate={(node, position, socketRef) =>
        void handleNodeCreate(node, position, socketRef)
      }
      onNodeDelete={handleNodeDeleteFromContextMenu}
      onNodeTogglePreview={handleNodeTogglePreview}
      getNodeById={getNodeById}
      customFunctions={getCustomFunctions()}
      uniforms={getUniforms()}
    >
      <canvas
        ref={canvasRef}
        className="shader-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          width: "100vw",
          height: "100vh",
          zIndex: 1,
        }}
      />
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
