import type { Context } from "@compiler/context";
import type { NodeEditor } from "rete";
import type { Schemes, AreaExtra } from "../graph/node";
import { Compiler } from "@compiler/compiler";
import type { AreaPlugin } from "rete-area-plugin";
import { editorToGraph } from "./saveGraph";

export function compileGraph(
  editor: NodeEditor<Schemes>,
  area?: AreaPlugin<Schemes, AreaExtra>
): Context | undefined {
  const graph = editorToGraph(editor, area);
  try {
    const compiler = new Compiler(graph);
    const node = graph.nodes.find((n) => n.nodeType === "preview");
    if (!node) {
      throw new Error("Preview node not found in graph");
    }
    return compiler.compile(node.identifier);
  } catch (error) {
    console.error("Compilation error:", error);
    return undefined;
  }
}
