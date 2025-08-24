import type { Uniform } from "@graph/uniform";
import type { ShaderEntry } from "./shaderEntry";
import type { ShaderEntryContextType } from "./ShaderEntryContext";

export class ShaderRenderer implements ShaderEntryContextType {
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    const gl = canvas.getContext("webgl", { alpha: true });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Use unit quad (0,0 to 1,1) with UV coordinates
    // Vertices: x, y, u, v (position + UV coordinates)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        // Triangle 1
        0,
        0,
        0,
        0, // Bottom-left
        1,
        0,
        1,
        0, // Bottom-right
        0,
        1,
        0,
        1, // Top-left
        // Triangle 2
        0,
        1,
        0,
        1, // Top-left
        1,
        0,
        1,
        0, // Bottom-right
        1,
        1,
        1,
        1, // Top-right
      ]),
      gl.STATIC_DRAW
    );

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let timerId: number;
    const startTime = performance.now();
    const loop = (time: number) => {
      const elapsed = (time - startTime) / 1000;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      for (const entry of this.entries) {
        entry.render(gl, elapsed, canvas.width, canvas.height);
      }

      timerId = requestAnimationFrame(loop);
    };
    timerId = requestAnimationFrame(loop);

    this.deinit = () => {
      if (timerId) {
        cancelAnimationFrame(timerId);
      }
      window.removeEventListener("resize", resize);
    };
  }

  dispose() {
    this.deinit?.();
  }

  canvas: HTMLCanvasElement;
  private entries: ShaderEntry[] = [];
  private deinit?: () => void;

  addEntry = (entry: ShaderEntry) => {
    this.entries.push(entry);
  };

  removeEntry = (entry: ShaderEntry) => {
    this.entries = this.entries.filter((e) => e !== entry);
  };

  updateEntryShader = (entry: ShaderEntry, fragment: string) => {
    const existingEntry = this.entries.find((e) => e === entry);
    if (existingEntry) {
      existingEntry.setShader(fragment);
    }
  };

  updateUniform = (uniform: Uniform) => {
    // TODO
  };

  updateEntryPosition = (
    entry: ShaderEntry,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    const existingEntry = this.entries.find((e) => e === entry);
    if (existingEntry) {
      existingEntry.setPosition(x, y, w, h);
    }
  };
}
