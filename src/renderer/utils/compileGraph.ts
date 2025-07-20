import type { Expression } from "@compiler/context";
import { Compiler } from "@compiler/compiler";
import { editorToGraph } from "./saveGraph";
import type { EditorData } from "renderer/editorView";

export function compileGraph(editorData: EditorData): Expression | undefined {
  const graph = editorToGraph(editorData);
  try {
    const compiler = new Compiler(graph);
    const node = graph.nodes.find((n) => n.nodeType === "preview");
    if (!node) {
      throw new Error("Preview node not found in graph");
    }
    const output = compiler.compile(node.identifier);
    return output.outputs["out"];
  } catch (error) {
    console.error("Compilation error:", error);
    return undefined;
  }
}
