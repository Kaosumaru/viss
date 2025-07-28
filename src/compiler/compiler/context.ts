import type { Type } from "../glsl/types/types";

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
  variables: Variable[];
  outputs: Record<string, Expression>;
}
