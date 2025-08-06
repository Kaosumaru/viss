import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js', // ✅ your custom name
        // If needed:
        // chunkFileNames: 'chunks/[name].js',
        // assetFileNames: 'assets/[name][extname]',
      }
    }
  },
  resolve: {
    alias: {
      "@compiler": path.resolve(__dirname, "src/compiler/compiler"),
      "@glsl": path.resolve(__dirname, "src/compiler/glsl"),
      "@graph": path.resolve(__dirname, "src/compiler/graph"),
      "@test": path.resolve(__dirname, "src/compiler/test"),
    },
  },
  plugins: [react()],
});
