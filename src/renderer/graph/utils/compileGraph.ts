import { Compiler } from "@compiler/compiler";
import type { Context } from "@compiler/context";
import type { FunctionDefinition } from "@glsl/function";
import { exportGlsl } from "@compiler/exporter/glslExport";

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
        return undefined;
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

    return exportGlsl(this.compiler_, output, outExpression);
  }

  compiler(): Compiler {
    return this.compiler_;
  }

  private compiler_: Compiler;
}
