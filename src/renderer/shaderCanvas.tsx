import { useContext, useEffect, useRef } from "react";
import { ShaderRenderer } from "./components/shaderOverlay/shaderRenderer";
import type { ShaderEntry } from "./components/shaderOverlay/shaderEntry";
import { EditorContext } from "./context/EditorContext";

type ShaderCanvasProps = {
  vertexShader: string;
  fragmentShader: string;
};

const previewSize = 256;

export const ShaderCanvas: React.FC<ShaderCanvasProps> = ({
  fragmentShader,
}) => {
  const editorData = useContext(EditorContext).editor;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderer = useRef<ShaderRenderer | null>(null);
  const shaderEntryRef = useRef<ShaderEntry | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderer.current = new ShaderRenderer(canvasRef.current, false);
      shaderEntryRef.current = renderer.current.addEntry();
      renderer.current.updateEntryPosition(
        shaderEntryRef.current,
        0,
        0,
        previewSize,
        previewSize
      );
    }
    return () => {
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, []);

  useEffect(() => {
    if (editorData && renderer.current) {
      const dispose = editorData.addUniformCallback(renderer.current);
      return () => {
        dispose();
      };
    }
  }, [editorData]);

  useEffect(() => {
    if (shaderEntryRef.current) {
      renderer.current?.updateEntryShader(
        shaderEntryRef.current,
        fragmentShader
      );
    }
  }, [fragmentShader]);

  return (
    <canvas
      ref={canvasRef}
      width={previewSize}
      height={previewSize}
      style={{ display: "block" }}
    />
  );
};
