import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["**/*.test.tsx", "**/*.test.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@compiler": path.resolve(__dirname, "src/compiler/compiler"),
      "@glsl": path.resolve(__dirname, "src/compiler/glsl"),
      "@graph": path.resolve(__dirname, "src/compiler/graph"),
      "@test": path.resolve(__dirname, "src/compiler/test"),
    },
  },
});
