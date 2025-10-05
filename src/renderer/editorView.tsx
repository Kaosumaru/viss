import { useRete } from "rete-react-plugin";
import { createEditor, type OnGraphChanged } from "./graph/editor";
import { useCallback, useEffect, useRef } from "react";
import { ContextMenuProvider } from "./components/contextMenu/contextMenuProvider";
import { UICompilerNode } from "./graph/nodes/compilerNode";
import type { EditorAPI } from "./graph/interface";
import {
  NodeSelectionArea,
  getNodesInSelectionArea,
} from "./components/selectionArea";
import type { SelectionRect } from "./components/selectionArea";
import { ShaderRenderer } from "./components/shaderOverlay/shaderRenderer";

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
    <ContextMenuProvider
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
    </ContextMenuProvider>
  );

  return contextMenuProvider;
}
