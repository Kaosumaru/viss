import { Compiler } from "@compiler/compiler";
import { saveGraph } from "../graph/utils/saveGraph";
import type { EditorData } from "renderer/graph/interface";
import type { Variable } from "@compiler/context";
import { typeToGlsl } from "@glsl/typeToString";

export function compileGraph(editorData: EditorData): string | undefined {
  const graph = saveGraph(editorData);
  try {
    const compiler = new Compiler(graph);
    const node = graph.nodes.find((n) => n.nodeType === "preview");
    if (!node) {
      throw new Error("Preview node not found in graph");
    }
    const output = compiler.compile(node.identifier);
    const outExpression = output.outputs["out"];

    const variables = output.variables
      .map((variable: Variable) => compileVariable(variable, 1))
      .join("\n");
    const fragmentShader = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
void main() {
${variables}
  gl_FragColor = ${outExpression.data}; 
}`;

    return fragmentShader;
  } catch (error) {
    console.error("Compilation error:", error);
    return undefined;
  }
}

function compileVariable(variable: Variable, level: number): string {
  const type = typeToGlsl(variable.type);
  const indent = " ".repeat(level * 2);
  return `${indent}${type} ${variable.name} = ${variable.data};`;
}
