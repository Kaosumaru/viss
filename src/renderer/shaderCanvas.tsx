import React, { useRef } from "react";
import { ShaderRenderer } from "./components/shaderOverlay/shaderRenderer";

type ShaderCanvasProps = {
  vertexShader: string;
  fragmentShader: string;
};

export const ShaderCanvas: React.FC<ShaderCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderer = useRef<ShaderRenderer | null>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      renderer.current = new ShaderRenderer(canvasRef.current, false);
    }
    return () => {
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={256}
      style={{ display: "block" }}
    />
  );
};
