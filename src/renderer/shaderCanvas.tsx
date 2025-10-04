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
    if (canvasRef.current) {
      renderer.current = new ShaderRenderer(canvasRef.current, false);
      shaderEntryRef.current = renderer.current.addEntry();
      
      const size = isFullscreen && containerRef.current 
        ? Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight)
        : previewSize;
      
      renderer.current.updateEntryPosition(
        shaderEntryRef.current,
        0,
        0,
        size,
        size
      );
    }
    return () => {
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, [isFullscreen]);

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
    if (!isFullscreen || !canvasRef.current || !containerRef.current || !renderer.current || !shaderEntryRef.current) {
      return;
    }

    const updateSize = () => {
      if (containerRef.current && canvasRef.current && renderer.current && shaderEntryRef.current) {
        const size = Math.min(
          containerRef.current.clientWidth - 24, // Account for padding
          containerRef.current.clientHeight - 24
        );
        
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        
        renderer.current.updateEntryPosition(
          shaderEntryRef.current,
          0,
          0,
          size,
          size
        );
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [isFullscreen]);

  const canvasSize = isFullscreen ? '100%' : `${previewSize}px`;

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: canvasSize,
        height: canvasSize,
        maxWidth: '100%',
        maxHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <canvas
        ref={canvasRef}
        width={previewSize}
        height={previewSize}
        style={{ display: "block", pointerEvents: "none", maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
};
