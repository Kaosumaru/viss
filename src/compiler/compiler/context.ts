import type { Type } from "../glsl/types";

export interface OutputData {
  type: Type;
  mainOutput: string;
}

export interface Context {
  type: Type;
  outputs: Record<string, OutputData>;
}
