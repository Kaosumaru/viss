import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
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
