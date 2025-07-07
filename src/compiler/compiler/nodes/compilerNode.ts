import type { Context } from "../context";

export interface NodeContext {
  getInput(name: string): Context | undefined;
  getParam(name: string): unknown | undefined;
}

export abstract class CompilerNode {
  abstract compile(ctx: Context, node: NodeContext): Context;
}
