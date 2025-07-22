import { createContext, useContext } from "react";
import { ShaderEntry } from "./shaderEntry";

export interface ShaderEntryContextType {
  addEntry: (entry: ShaderEntry) => void;
  removeEntry: (entry: ShaderEntry) => void;
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
