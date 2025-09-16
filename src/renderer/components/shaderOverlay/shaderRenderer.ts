import type { Uniform, Uniforms } from "@graph/uniform";
import { ShaderEntry } from "./shaderEntry";
import type { ShaderEntryContextType } from "./ShaderEntryContext";
import { uniformEntryFromUniform } from "./uniform";
import { loadTexture } from "./helpers";
import type { EditorAPI } from "@renderer/graph/interface";

export class ShaderRenderer implements ShaderEntryContextType {
  constructor(editor: EditorAPI, canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.editor = editor;

    const gl = canvas.getContext("webgl", { alpha: true });
    this.gl = gl;
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

  addEntry = (): ShaderEntry => {
    const entry = new ShaderEntry(this);
    this.entries.push(entry);

    for (const uniform of Object.values(this.uniforms)) {
      entry.updateUniform(uniformEntryFromUniform(uniform));
    }

    return entry;
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
    const oldTexturePath = this.getTexturePath(this.uniforms[uniform.id]);
    if (oldTexturePath) {
      this.unloadTexture(uniform.id, oldTexturePath);
    }

    this.uniforms[uniform.id] = uniform;

    const newTexturePath = this.getTexturePath(uniform);
    if (newTexturePath) {
      this.loadTexture(uniform.id, newTexturePath);
    }

    const uniformEntry = uniformEntryFromUniform(uniform);
    for (const entry of this.entries) {
      entry.updateUniform(uniformEntry);
    }
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

  getTexturePath(uniform: Uniform | undefined) {
    if (
      uniform &&
      uniform.type.id === "sampler2D" &&
      uniform.defaultValue &&
      uniform.defaultValue.type === "string"
    ) {
      return uniform.defaultValue.value;
    }
    return undefined;
  }

  getTexture(path: string): number {
    const entry = this.textures.get(path);
    if (entry) {
      return entry.uniformUnit;
    }
    return -1;
  }

  unloadTexture(id: string, path: string) {
    const entry = this.textures.get(path);
    if (!entry) {
      return;
    }

    entry.uniforms.delete(id);
    if (entry.uniforms.size !== 0) {
      return;
    }

    const unit = entry.uniformUnit;
    this.freeTextures.unshift(unit);

    this.textures.delete(path);
  }

  loadTexture(id: string, path: string) {
    if (!this.gl) return;
    let entry = this.textures.get(path);
    if (!entry) {
      const unit = this.freeTextures.pop();
      if (unit === undefined) {
        return;
      }
      const texture = loadTexture(this.gl);
      entry = {
        uniforms: new Set(),
        uniformUnit: unit,
        texture: texture.texture,
      };

      this.editor.relativePathToURL(path).then((url) => {
        if (url) {
          texture.load(url);
        }
      });
      this.textures.set(path, entry);
    }

    entry.uniforms.add(id);
  }

  freeTextures = [0, 1, 2, 3, 4, 5, 6, 7];

  uniforms: Uniforms = {};
  textures = new Map<string, TextureEntry>();
  gl: WebGLRenderingContext | null;
  editor: EditorAPI;
}

interface TextureEntry {
  uniforms: Set<string>;
  uniformUnit: number;
  texture: WebGLTexture;
}
