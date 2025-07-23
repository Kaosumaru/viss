import type {
  FunctionPrototypeNode,
  ParameterDeclarationNode,
  TypeSpecifierNode,
} from "@shaderfrog/glsl-parser/ast";
import { scalar, vector, type Type } from "./types";
import { parse } from "@shaderfrog/glsl-parser";
import type { Graph } from "@graph/graph";

export interface FunctionDefinition {
  name: string;
  parameters: ParameterDefinition[];
  returnType: Type;
}

export interface ParameterDefinition {
  name: string;
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
  const functions = p.program
    .filter((node) => node.type === "function")
    .map((f) => f.prototype);
  return functions.map(functionNodeToDefinition);
}

function functionNodeToDefinition(
  node: FunctionPrototypeNode
): FunctionDefinition {
  const parameters: ParameterDefinition[] = node.parameters.map(
    parameterNodeToDefinition
  );

  return {
    name: node.header.name.identifier,
    parameters,
    returnType: typeToType(node.header.returnType.specifier),
  };
}

function parameterNodeToDefinition(
  node: ParameterDeclarationNode
): ParameterDefinition {
  return {
    name: node.identifier.identifier,
    type: typeToType(node.specifier),
  };
}

function typeToType(type: TypeSpecifierNode): Type {
  if (type.specifier.type !== "keyword") {
    throw new Error(`Unsupported type specifier: ${type.specifier.type}`);
  }
  const type_name = type.specifier.token;
  switch (type_name) {
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
