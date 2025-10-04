import { useContext, useEffect, useRef } from "react";
import { ShaderRenderer } from "./components/shaderOverlay/shaderRenderer";
import type { ShaderEntry } from "./components/shaderOverlay/shaderEntry";
import { EditorContext } from "./context/EditorContext";

type ShaderCanvasProps = {
  vertexShader: string;
  fragmentShader: string;
  isFullscreen?: boolean;
};

const previewSize = 256;

export const ShaderCanvas: React.FC<ShaderCanvasProps> = ({
  fragmentShader,
  isFullscreen = false,
}) => {
  const editorData = useContext(EditorContext).editor;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderer = useRef<ShaderRenderer | null>(null);
  const shaderEntryRef = useRef<ShaderEntry | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    renderer.current = new ShaderRenderer(canvasRef.current, false);
    shaderEntryRef.current = renderer.current.addEntry();
    return () => {
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, [canvasRef]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    if (!shaderEntryRef.current) return;

    renderer.current?.updateEntryPosition(
      shaderEntryRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
  }, [isFullscreen, containerRef]);

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

  // Update canvas size when fullscreen state changes or window resizes
  useEffect(() => {
    if (
      !isFullscreen ||
      !canvasRef.current ||
      !containerRef.current ||
      !renderer.current ||
      !shaderEntryRef.current
    ) {
      return;
    }

    const updateSize = () => {
      if (
        containerRef.current &&
        canvasRef.current &&
        renderer.current &&
        shaderEntryRef.current
      ) {
        renderer.current.updateEntryPosition(
          shaderEntryRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [isFullscreen, containerRef]);

  const canvasSize = isFullscreen ? "100%" : `${previewSize}px`;

  return (
    <div
      ref={containerRef}
      style={{
        width: canvasSize,
        height: canvasSize,
        maxWidth: "100%",
        maxHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",

          pointerEvents: "none",
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      />
    </div>
  );
};
