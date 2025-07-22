import React, { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { ShaderEntry } from "../components/shaderOverlay/shaderEntry";
import { ShaderEntryContext } from "./ShaderEntryContext";

interface ShaderEntryProviderProps {
  children: ReactNode;
}

export const ShaderEntryProvider: React.FC<ShaderEntryProviderProps> = ({
  children,
}) => {
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

  return (
    <ShaderEntryContext.Provider
      value={{ addEntry, removeEntry, updateEntryPosition }}
    >
      {children}
      <ShaderOverlayRenderer entries={entries} />
    </ShaderEntryContext.Provider>
  );
};

// Internal component to render the shader overlay
const ShaderOverlayRenderer: React.FC<{ entries: ShaderEntry[] }> = ({
  entries,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const startTime = React.useRef(performance.now());

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Use unit quad (0,0 to 1,1) instead of NDC coordinates
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
      gl.STATIC_DRAW
    );

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = (time: number) => {
      const elapsed = (time - startTime.current) / 1000;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      for (const entry of entries) {
        entry.render(gl, elapsed, canvas.width, canvas.height);
      }

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [entries]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
      }}
    />
  );
};
