import { createContext, useContext } from "react";
import { ShaderEntry } from "./shaderEntry";
import type { Uniform } from "@graph/uniform";

export interface ShaderEntryContextType {
  addEntry: () => ShaderEntry;
  removeEntry: (entry: ShaderEntry) => void;
  updateEntryShader: (entry: ShaderEntry, fragment: string) => void;
  updateUniform: (uniform: Uniform) => void;
  updateEntryPosition: (
    entry: ShaderEntry,
    x: number,
    y: number,
    w: number,
    h: number
  ) => void;
}

export const ShaderEntryContext = createContext<ShaderEntryContextType | null>(
  null
);

export const useShaderEntry = () => {
  const context = useContext(ShaderEntryContext);
  if (!context) {
    throw new Error("useShaderEntry must be used within a ShaderEntryProvider");
  }
  return context;
};
