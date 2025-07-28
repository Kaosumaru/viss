import type {
  FunctionPrototypeNode,
  ParameterDeclarationNode,
  TypeSpecifierNode,
} from "@shaderfrog/glsl-parser/ast";
import { scalar, vector, type Type } from "./types/types";
import { parse } from "@shaderfrog/glsl-parser";
import type { Graph } from "@graph/graph";

export interface FunctionDefinition {
  name: string;
  parameters: ParameterDefinition[];
  returnType?: Type;

  pragmas: Set<string>;
}

export type Mode = "in" | "out" | "inout";

export interface ParameterDefinition {
  name: string;
  mode: Mode;
  type: Type;
}

export function parseFunctionsFrom(
  graph: Graph
): Record<string, FunctionDefinition> {
  const functions: FunctionDefinition[] = graph.includes
    .map((include) => listFunctions(include.content))
    .flat();

  const functionMap: Record<string, FunctionDefinition> = {};
  for (const func of functions) {
    functionMap[func.name] = func;
  }
  return functionMap;
}

export function listFunctions(glsl: string): FunctionDefinition[] {
  const p = parse(glsl);
  if (!p) {
    throw new Error("Failed to parse GLSL code");
  }

  const definitions: FunctionDefinition[] = [];
  let pragmas: string[] = [];

  for (const statement of p.program) {
    switch (statement.type) {
      case "function": {
        if (pragmas.includes("export")) {
          const func = functionNodeToDefinition(statement.prototype, pragmas);
          definitions.push(func);
        }
        pragmas = [];
        continue;
      }

      case "preprocessor": {
        pragmas.push(...extractPragmas(statement.line));
        continue;
      }

      default: {
        pragmas = [];
      }
    }
  }

  return definitions;
}

function extractPragmas(line: string): string[] {
  const prefix = "editor:";
  const index = line.indexOf(prefix);
  if (index === -1) {
    return [];
  }
  const pragmas = line
    .slice(index + prefix.length)
    .split(",")
    .map((p) => p.trim());
  return pragmas;
}

function functionNodeToDefinition(
  node: FunctionPrototypeNode,
  pragmas: string[]
): FunctionDefinition {
  const parameters: ParameterDefinition[] = node.parameters.map(
    parameterNodeToDefinition
  );

  return {
    name: node.header.name.identifier,
    parameters,
    returnType: typeToType(node.header.returnType.specifier),
    pragmas: new Set(pragmas),
  };
}

function parameterNodeToDefinition(
  node: ParameterDeclarationNode
): ParameterDefinition {
  return {
    name: node.identifier.identifier,
    mode: "in",
    type: typeToType(node.specifier)!,
  };
}

function typeToType(type: TypeSpecifierNode): Type | undefined {
  if (type.specifier.type !== "keyword") {
    throw new Error(`Unsupported type specifier: ${type.specifier.type}`);
  }
  const type_name = type.specifier.token;
  switch (type_name) {
    case "void":
      return undefined;
    case "float":
      return scalar("float");
    case "vec2":
      return vector("float", 2);
    case "vec3":
      return vector("float", 3);
    case "vec4":
      return vector("float", 4);
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}
