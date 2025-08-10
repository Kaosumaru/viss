import { Compiler } from "@compiler/compiler";
import type { Context, Variable } from "@compiler/context";
import { typeToGlsl } from "@glsl/types/typeToString";
import type { FunctionDefinition } from "@glsl/function";
import { convertToVector4 } from "@compiler/nodes/out/utils";

export class CompilationHelper {
  constructor(compiler?: Compiler) {
    this.compiler_ = compiler ?? new Compiler();
  }

  getCustomFunctions(): FunctionDefinition[] {
    if (!this.compiler_) {
      return [];
    }
    return this.compiler_.getCustomFunctions();
  }

  compileNode(nodeId?: string, outputPin?: string): string | undefined {
    if (!this.compiler_) {
      return undefined;
    }

    if (!nodeId) {
      const graph = this.compiler_.getGraph();
      const node = graph.nodes.find((n) => n.nodeType === "output");
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

  private outputToGLSL(output: Context, outputPin?: string): string {
    const outExpression = outputPin
      ? output.outputs[outputPin]
      : Object.values(output.outputs)[0];

    const vec4 = convertToVector4(outExpression);

    const graph = this.compiler_.getGraph();
    const variables = output.variables
      .map((variable: Variable) => compileVariable(variable, 1))
      .join("\n");
    const fragmentShader = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 v_uv;

${graph.includes.map((include) => include.content).join("\n")}

void main() {
${variables}
  gl_FragColor = ${vec4.data}; 
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
