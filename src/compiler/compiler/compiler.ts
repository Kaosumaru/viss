import type { Node } from "@graph/node";
import type { Context } from "./context";
import { Any } from "@glsl/types";

export class Compiler {
  compile(node: Node): Context {
    const ctx: Context = {
      type: Any,
      mainOutput: "",
    };

    return ctx;
  }

  nodes: Map<string, Node> = new Map();
}
