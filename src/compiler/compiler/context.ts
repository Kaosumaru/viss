import type { Type } from "../glsl/types";

export interface OutputData {
  type: Type;
  mainOutput: string;
}

export interface Context {
  outputs: Record<string, OutputData>;
}
