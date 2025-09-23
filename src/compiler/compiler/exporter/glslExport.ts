import type { Compiler } from "@compiler/compiler";
import type { Context, Expression, Variable } from "@compiler/context";
import { convertToVector4 } from "@compiler/nodes/out/utils";
import { typeToGlsl } from "@glsl/types/typeToString";

export function exportGlsl(
  compiler: Compiler,
  ctx: Context,
  expression: Expression
) {
  const vec4 = convertToVector4(expression);

  const graph = compiler.getGraph();
  const variables = ctx.variables
    .map((variable: Variable) => compileVariable(variable, 1))
    .join("\n");

  const uniforms = Object.entries(graph.uniforms)
    .map(([name, uniform]) => {
      const type = typeToGlsl(uniform.type);
      return `uniform ${type} ${name};`;
    })
    .join("\n");

  const includeFiles = compiler.getIncludes();

  const fragmentShader = `
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
${uniforms}

varying vec2 vUv;

${includeFiles.map((include) => include.content).join("\n")}

void main() {
${variables}
  gl_FragColor = ${vec4.data}; 
}`;

  return fragmentShader;
}

function compileVariable(variable: Variable, level: number): string {
  const type = typeToGlsl(variable.type);
  const indent = " ".repeat(level * 2);
  return `${indent}${type} ${variable.name} = ${variable.data};`;
}
