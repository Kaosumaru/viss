import { defineConfig, type BuildEnvironmentOptions } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  build: buildOptions(mode),
  define: defineOptions(mode),
  resolve: {
    alias: {
      "@compiler": path.resolve(__dirname, "src/compiler/compiler"),
      "@renderer": path.resolve(__dirname, "src/renderer"),
      "@glsl": path.resolve(__dirname, "src/compiler/glsl"),
      "@graph": path.resolve(__dirname, "src/compiler/graph"),
      "@test": path.resolve(__dirname, "src/compiler/test"),
    },
  },
  plugins: [react()],
}));

function buildOptions(mode: string): BuildEnvironmentOptions | undefined {
  if (mode === "vscode-extension") {
    return {
      rollupOptions: {
        output: {
          entryFileNames: "assets/index.js", // ✅ your custom name
          // If needed:
          // chunkFileNames: 'chunks/[name].js',
          // assetFileNames: 'assets/[name][extname]',
        },
      },
    };
  }
  return undefined;
}

function defineOptions(mode: string): Record<string, unknown> {
  const defines: Record<string, unknown> = {};

  if (mode === "vscode-extension") {
    defines.__VSCODE_EXTENSION__ = true;
  } else {
    defines.__VSCODE_EXTENSION__ = false;
  }

  return defines;
}
