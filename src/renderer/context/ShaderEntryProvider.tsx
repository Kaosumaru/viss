import React from "react";
import type { ReactNode } from "react";
import {
  ShaderEntryContext,
  type ShaderEntryContextType,
} from "./ShaderEntryContext";

interface ShaderEntryProviderProps {
  children: ReactNode;
  context: ShaderEntryContextType;
}

export const ShaderEntryProvider: React.FC<ShaderEntryProviderProps> = ({
  children,
  context,
}) => {
  return (
    <ShaderEntryContext.Provider value={context}>
      {children}
    </ShaderEntryContext.Provider>
  );
};
