import type { Type } from "../glsl/types";

export interface OutputData {
  type: Type;
  expression: string;
  trivial: boolean;
}

export interface Context {
  outputs: Record<string, OutputData>;
}
