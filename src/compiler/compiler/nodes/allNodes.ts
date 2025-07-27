import { Any, scalar, vector } from "@glsl/types";
import { LiteralNode } from "./basic/literal";
import { BooleanLiteralNode } from "./basic/booleanLiteral";
import type { CompilerNode } from "./compilerNode";
import { add } from "./operators/add";
import { substract } from "./operators/substract";
import { preview } from "./out/preview";
import { output as outputNode } from "./out/output";
import { UniformNode } from "./uniforms/uniform";
import { divide } from "./operators/divide";
import { GetMember } from "./vector/getMember";
import { composeVector4 } from "./vector/composeVector4";
import { FunctionNode } from "./functions/functionNode";
import { decomposeVector4 } from "./vector/decomposeVector4";
import { decomposeVector2 } from "./vector/decomposeVector2";
import { coords } from "./utils/coords";
import { multiply } from "./operators/multiply";
import { glslFunction } from "./functions/glslFunction";
import { color } from "./basic/color";

export interface NodeCategory {
  id: string;
  name: string;
  nodes: Record<string, CompilerNode>;
}

interface SpecializedNodeCategory<
  ID extends string,
  T extends Record<string, CompilerNode>
> extends NodeCategory {
  id: ID;
  name: string;
  nodes: T;
}

export function createCategory<
  ID extends string,
  T extends Record<string, CompilerNode>
>(category: SpecializedNodeCategory<ID, T>) {
  return category;
}

const literals = createCategory({
  id: "literals",
  name: "Literals",
  nodes: {
    float: new LiteralNode(scalar("float")),
    bool: new BooleanLiteralNode(),
    color,

    // vector2: new LiteralNode(vector("float", 2)),
    // vector3: new LiteralNode(vector("float", 3)),
    // vector4: new LiteralNode(vector("float", 4)),
  },
});

const operators = createCategory({
  id: "operators",
  name: "Operators",
  nodes: {
    add,
    substract,
    divide,
    multiply,
  },
});

const functions = createCategory({
  id: "functions",
  name: "Functions",
  nodes: {
    length: new FunctionNode("length", "Length of a vector", scalar("float"), [
      ["in", Any],
    ]),
    sin: new FunctionNode("sin", "Sine function", scalar("float"), [
      ["in", scalar("float")],
    ]),
    abs: new FunctionNode("abs", "Absolute value", scalar("float"), [
      ["in", scalar("float")],
    ]),
    // TODo this doesn't work correctly, as we are returning any type, and output node can't display it
    mix: new FunctionNode("mix", "Linear interpolation", Any, [
      ["x", Any],
      ["y", Any],
      ["a", Any],
    ]),
  },
});

const vectors = createCategory({
  id: "vectors",
  name: "Vectors",
  nodes: {
    getX: new GetMember("x", vector("float", 2), scalar("float")),
    getY: new GetMember("y", vector("float", 2), scalar("float")),

    composeVector4,
    decomposeVector2,
    decomposeVector4,
  },
});

const uniforms = createCategory({
  id: "uniforms",
  name: "Uniforms",
  nodes: {
    time: new UniformNode(
      "time",
      "Elapsed time in seconds",
      "u_time",
      scalar("float")
    ),
    resolution: new UniformNode(
      "resolution",
      "Screen resolution",
      "u_resolution",
      vector("float", 2)
    ),
    fragCoord: new UniformNode(
      "fragCoord",
      "Fragment coordinates",
      "gl_FragCoord",
      vector("float", 4)
    ),
    uv: new UniformNode("uv", "UV coordinates", "v_uv", vector("float", 2)),
  },
});

const output = createCategory({
  id: "output",
  name: "Output",
  nodes: {
    output: outputNode,
    preview,
  },
});

const utils = createCategory({
  id: "utils",
  name: "Utils",
  nodes: {
    coords,
  },
});

export const nodeCategories = [
  literals,
  operators,
  functions,
  vectors,
  uniforms,
  output,
  utils,
] as const;

export type NodeCategoryId = (typeof nodeCategories)[number]["id"];

export const nodes = {
  ...literals.nodes,
  ...operators.nodes,
  ...functions.nodes,
  ...vectors.nodes,
  ...uniforms.nodes,
  ...output.nodes,
  ...utils.nodes,

  glslFunction,
};

export type NodeType = keyof typeof nodes;
export function getNode(type: NodeType): CompilerNode {
  const node = nodes[type];
  if (!node) {
    throw new Error(`Node type "${type}" not found`);
  }
  return node;
}
