import { Compiler } from "@compiler/compiler";
import { saveGraph } from "./saveGraph";
import type { EditorData } from "renderer/graph/interface";
import type { Context, Variable } from "@compiler/context";
import { typeToGlsl } from "@glsl/typeToString";
import type { Graph } from "@graph/graph";

export class CompilationHelper {
  updateGraph(editorData: EditorData) {
    this.graph = saveGraph(editorData);
    if (!this.graph) {
      throw new Error("Failed to save graph");
    }
    this.compiler = new Compiler(this.graph);
  }

  compileNode(nodeId?: string): string | undefined {
    if (!this.compiler || !this.graph) {
      return undefined;
    }

    if (!nodeId) {
      const node = this.graph.nodes.find((n) => n.nodeType === "preview");
      if (!node) {
        throw new Error("Preview node not found in graph");
      }
      nodeId = node.identifier;
    }

    if (!nodeId) {
      throw new Error("Node ID is required for compilation");
    }

    try {
      const output = this.compiler.compile(nodeId);
      return this.outputToGLSL(output);
    } catch (error) {
      console.error("Compilation error:", error);
      return undefined;
    }
  }

  private outputToGLSL(output: Context): string {
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
  }

  private graph?: Graph;
  private compiler?: Compiler;
}

function compileVariable(variable: Variable, level: number): string {
  const type = typeToGlsl(variable.type);
  const indent = " ".repeat(level * 2);
  return `${indent}${type} ${variable.name} = ${variable.data};`;
}
