import { Compiler } from "@compiler/compiler";
import type { Context } from "@compiler/context";
import { exportGlsl } from "@compiler/exporter/glslExport";

export function compileNode(
  compiler: Compiler,
  nodeId?: string,
  outputPin?: string
): string | undefined {
  if (!nodeId) {
    const graph = compiler.getGraph();
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
    const output = compiler.compile(nodeId);
    return outputToGLSL(compiler, output, outputPin);
  } catch (error) {
    console.error("Compilation error:", error);
    return undefined;
  }
}

function outputToGLSL(
  compiler: Compiler,
  output: Context,
  outputPin?: string
): string {
  const outExpression = outputPin
    ? output.outputs[outputPin]
    : Object.values(output.outputs)[0];

  if (!outExpression) {
    throw new Error("Output pin not found in the compiled context");
  }

  return exportGlsl(compiler, output, outExpression);
}
