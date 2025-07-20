import type { Type } from "../glsl/types";

export interface Variable {
  name: string;
  type: Type;
  data: string;
}

export interface Expression {
  type: Type;
  data: string;
  trivial: boolean;
}

export interface Context {
  outputs: Record<string, Expression>;
}
