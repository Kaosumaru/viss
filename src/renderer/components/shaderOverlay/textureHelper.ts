import type { EditorAPI } from "@renderer/graph/interface";
import { loadTexture } from "./helpers";

export class TextureHelper {
  constructor(editor: EditorAPI, gl: WebGLRenderingContext) {
    this.editor = editor;
    this.gl = gl;
  }

  getTextureId(path: string): number {
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
        // TODO display warning
        return;
      }

      this.gl.activeTexture(this.gl.TEXTURE0 + unit);
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

  private gl: WebGLRenderingContext;
  private editor: EditorAPI;
  private textures = new Map<string, TextureEntry>();
  private freeTextures = [0, 1, 2, 3, 4, 5, 6, 7];
}

interface TextureEntry {
  uniforms: Set<string>;
  uniformUnit: number;
  texture: WebGLTexture;
}
