import { Compiler } from "@compiler/compiler";
import type { Context, Variable } from "@compiler/context";
import { typeToGlsl } from "@glsl/typeToString";
import type { FunctionDefinition } from "@glsl/function";

export class CompilationHelper {
  constructor() {
    this.compiler_ = new Compiler();
  }

  getCustomFunctions(): FunctionDefinition[] {
    if (!this.compiler_) {
      return [];
    }
    return this.compiler_.getCustomFunctions();
  }

  compileNode(nodeId?: string, outputPin = "_preview"): string | undefined {
    if (!this.compiler_) {
      return undefined;
    }

    if (!nodeId) {
      const node = this.compiler_
        .getGraph()
        .nodes.find((n) => n.nodeType === "output");
      if (!node) {
        throw new Error("Preview node not found in graph");
      }
      nodeId = node.identifier;
    }

    if (!nodeId) {
      throw new Error("Node ID is required for compilation");
    }

    try {
      const output = this.compiler_.compile(nodeId);
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

  compiler(): Compiler {
    return this.compiler_;
  }

  private compiler_: Compiler;
}

function compileVariable(variable: Variable, level: number): string {
  const type = typeToGlsl(variable.type);
  const indent = " ".repeat(level * 2);
  return `${indent}${type} ${variable.name} = ${variable.data};`;
}
