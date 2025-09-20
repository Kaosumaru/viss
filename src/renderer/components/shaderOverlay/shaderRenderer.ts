import type { Uniform, Uniforms } from "@graph/uniform";
import { ShaderEntry } from "./shaderEntry";
import type { ShaderEntryContextType } from "./ShaderEntryContext";
import { uniformEntryFromUniform } from "./uniform";
import { getTexturePath } from "./helpers";
import type { EditorAPI } from "@renderer/graph/interface";
import { createBuffer } from "./buffer";
import { TextureHelper } from "./textureHelper";

export class ShaderRenderer implements ShaderEntryContextType {
  constructor(editor: EditorAPI, canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", { alpha: true });
    if (!gl) {
      throw new Error(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );
    }

    this.textureHelper = new TextureHelper(editor, gl);
    this.canvas = canvas;
    this.editor = editor;
    this.gl = gl;

    createBuffer(gl);
    const endResize = this.handleResize();
    const endRender = this.startRenderLoop();

    this.deinit = () => {
      endRender();
      endResize();
    };
  }

  private handleResize() {
    if (!this.gl) return () => {};
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }

  private startRenderLoop() {
    if (!this.gl) return () => {};
    const gl = this.gl;
    const canvas = this.canvas;

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

    return () => {
      if (timerId) {
        cancelAnimationFrame(timerId);
      }
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
    const oldTexturePath = getTexturePath(this.uniforms[uniform.id]);
    if (oldTexturePath) {
      this.textureHelper.unloadTexture(uniform.id, oldTexturePath);
    }

    this.uniforms[uniform.id] = uniform;

    const newTexturePath = getTexturePath(uniform);
    if (newTexturePath) {
      this.textureHelper.loadTexture(uniform.id, newTexturePath);
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

  uniforms: Uniforms = {};
  gl: WebGLRenderingContext;
  textureHelper: TextureHelper;
  editor: EditorAPI;
}
