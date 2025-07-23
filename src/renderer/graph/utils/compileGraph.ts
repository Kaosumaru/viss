import { Compiler } from "@compiler/compiler";
import { saveGraph } from "./saveGraph";
import type { Context, Variable } from "@compiler/context";
import { typeToGlsl } from "@glsl/typeToString";
import type { Graph } from "@graph/graph";
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { AreaExtra, Schemes } from "../node";

export class CompilationHelper {
  updateGraph(
    editor: NodeEditor<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>
  ) {
    this.graph = saveGraph(editor, area);
    if (!this.graph) {
      throw new Error("Failed to save graph");
    }
    this.compiler = new Compiler(this.graph);
  }

  compileNode(nodeId?: string, outputPin = "_preview"): string | undefined {
    if (!this.compiler || !this.graph) {
      return undefined;
    }

    if (!nodeId) {
      const node = this.graph.nodes.find((n) => n.nodeType === "output");
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
      return this.outputToGLSL(output, outputPin);
    } catch (error) {
      console.error("Compilation error:", error);
      return undefined;
    }
  }

  private outputToGLSL(output: Context, outputPin: string): string {
    const outExpression = output.outputs[outputPin];

    const variables = output.variables
      .map((variable: Variable) => compileVariable(variable, 1))
      .join("\n");
    const fragmentShader = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 v_uv;
void main() {
${variables}
  gl_FragColor = ${outExpression.data}; 
}`;

    return fragmentShader;
  }

  getCompiler(): Compiler {
    if (!this.compiler) {
      throw new Error("Compiler is not initialized. Call updateGraph first.");
    }
    return this.compiler;
  }

  private graph?: Graph;
  private compiler?: Compiler;
}

function compileVariable(variable: Variable, level: number): string {
  const type = typeToGlsl(variable.type);
  const indent = " ".repeat(level * 2);
  return `${indent}${type} ${variable.name} = ${variable.data};`;
}
