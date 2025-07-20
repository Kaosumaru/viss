import { Compiler } from "@compiler/compiler";
import { editorToGraph } from "./saveGraph";
import type { EditorData } from "renderer/editorView";
import type { Variable } from "@compiler/context";
import { typeToGlsl } from "@glsl/typeToString";

export function compileGraph(editorData: EditorData): string | undefined {
  const graph = editorToGraph(editorData);
  try {
    const compiler = new Compiler(graph);
    const node = graph.nodes.find((n) => n.nodeType === "preview");
    if (!node) {
      throw new Error("Preview node not found in graph");
    }
    const output = compiler.compile(node.identifier);
    const outExpression = output.outputs["out"];

    const variables = output.variables
      .map((variable: Variable) => compileVariable(variable))
      .join("\n");
    const fragmentShader = `
    precision mediump float;
    uniform float u_time;
    void main() {
      ${variables};
      gl_FragColor = ${outExpression.data}; 
    }`;

    return fragmentShader;
  } catch (error) {
    console.error("Compilation error:", error);
    return undefined;
  }
}

function compileVariable(variable: Variable): string {
  const type = typeToGlsl(variable.type);
  return `${type} ${variable.name} = ${variable.data};`;
}
