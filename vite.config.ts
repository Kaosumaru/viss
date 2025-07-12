import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@compiler": path.resolve(__dirname, "src/compiler"),
      "@glsl": path.resolve(__dirname, "src/glsl"),
      "@graph": path.resolve(__dirname, "src/graph"),
      "@test": path.resolve(__dirname, "src/test"),
    },
  },
  plugins: [react()],
});
