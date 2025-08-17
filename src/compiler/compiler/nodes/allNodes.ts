import { scalar, vector } from "@glsl/types/types";
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
import { ComposeVector } from "./vector/composeVector";
import { FunctionNode, signature } from "./functions/functionNode/functionNode";
import { decomposeVector } from "./vector/decomposeVector";
import { coords } from "./utils/coords";
import { multiply } from "./operators/multiply";
import { glslFunction } from "./functions/glslFunction";
import { color } from "./basic/color";
import {
  template,
  templateComponent,
  templateOrComponent,
  templateOrComponentOrBoolean,
} from "./functions/functionNode/templateResolver";
import {
  constrainedVector,
  constraintInfo,
  genFDType,
  genFIDType,
  genFIDUType,
  genFType,
} from "./functions/functionNode/constraintInfo";

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

    vec2: new ComposeVector("float", 2),
    vec3: new ComposeVector("float", 3),
    vec4: new ComposeVector("float", 4),

    dvec2: new ComposeVector("double", 2),
    dvec3: new ComposeVector("double", 3),
    dvec4: new ComposeVector("double", 4),

    bvec2: new ComposeVector("bool", 2),
    bvec3: new ComposeVector("bool", 3),
    bvec4: new ComposeVector("bool", 4),
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
    abs: new FunctionNode(
      "abs",
      "Absolute value",
      signature(template(), [["in", template()]], genFIDType)
    ),
    sign: new FunctionNode(
      "sign",
      "Sign of a value",
      signature(template(), [["in", template()]], genFIDType)
    ),
    floor: new FunctionNode(
      "floor",
      "Floor of a value",
      signature(template(), [["in", template()]], genFDType)
    ),
    ceil: new FunctionNode(
      "ceil",
      "Ceiling of a value",
      signature(template(), [["in", template()]], genFDType)
    ),
    fract: new FunctionNode(
      "fract",
      "Fractional part of a value",
      signature(template(), [["in", template()]], genFDType)
    ),
    mod: new FunctionNode(
      "mod",
      "Modulo operation",
      signature(
        template(),
        [
          ["x", template()],
          ["y", templateOrComponent()],
        ],
        genFDType
      )
    ),

    min: new FunctionNode(
      "min",
      "Minimum of two values",
      signature(
        template(),
        [
          ["x", template()],
          ["y", templateOrComponent()],
        ],
        genFIDUType
      )
    ),
    max: new FunctionNode(
      "max",
      "Maximum of two values",
      signature(
        template(),
        [
          ["x", template()],
          ["y", templateOrComponent()],
        ],
        genFIDUType
      )
    ),

    clamp: new FunctionNode(
      "clamp",
      "Clamp a value between a minimum and maximum",
      signature(
        template(),
        [
          ["x", template()],
          ["min", templateOrComponent()],
          ["max", templateOrComponent()],
        ],
        genFIDUType
      )
    ),

    mix: new FunctionNode(
      "mix",
      "Linear interpolation",
      signature(
        template(),
        [
          ["x", template()],
          ["y", template()],
          ["a", templateOrComponentOrBoolean()],
        ],
        genFDType
      )
    ),

    step: new FunctionNode(
      "step",
      "Step function",
      signature(
        template(),
        [
          ["edge", templateOrComponent()],
          ["x", template()],
        ],
        genFIDUType
      )
    ),

    smoothstep: new FunctionNode(
      "smoothstep",
      "Smooth step function",
      signature(
        template(),
        [
          ["edge0", templateOrComponent()],
          ["edge1", templateOrComponent()],
          ["x", template()],
        ],
        genFIDUType
      )
    ),
  },
});

const trigSignature = signature(template(), [["in", template()]], genFType);

const functionsTrig = createCategory({
  id: "functionsTrig",
  name: "Trigonometry",
  nodes: {
    radians: new FunctionNode(
      "radians",
      "Convert degrees to radians",
      trigSignature
    ),
    degrees: new FunctionNode(
      "degrees",
      "Convert radians to degrees",
      trigSignature
    ),
    sin: new FunctionNode("sin", "Sine function", trigSignature),
    cos: new FunctionNode("cos", "Cosine function", trigSignature),
    tan: new FunctionNode("tan", "Tangent function", trigSignature),
    asin: new FunctionNode("asin", "Arcsine function", trigSignature),
    acos: new FunctionNode("acos", "Arccosine function", trigSignature),
    atan: new FunctionNode("atan", "Arctangent function", trigSignature),

    // TODO missing atan2 override, which has two inputs
    sinh: new FunctionNode("sinh", "Hyperbolic sine function", trigSignature),
    cosh: new FunctionNode("cosh", "Hyperbolic cosine function", trigSignature),
    tanh: new FunctionNode(
      "tanh",
      "Hyperbolic tangent function",
      trigSignature
    ),
  },
});

const functionsVec = createCategory({
  id: "functionsVec",
  name: "Vector Functions",
  nodes: {
    length: new FunctionNode(
      "length",
      "Length of a vector",
      signature(templateComponent(), [["in", template()]], genFDType)
    ),
    distance: new FunctionNode(
      "distance",
      "Distance between two points",
      signature(
        templateComponent(),
        [
          ["p1", template()],
          ["p2", template()],
        ],
        genFDType
      )
    ),
    dot: new FunctionNode(
      "dot",
      "Dot product of two vectors",
      signature(
        templateComponent(),
        [
          ["v1", template()],
          ["v2", template()],
        ],
        genFDType
      )
    ),
    cross: new FunctionNode(
      "cross",
      "Cross product of two vectors",
      signature(
        template(),
        [
          ["x", template()],
          ["y", template()],
        ],
        constraintInfo(["float", "double"], [constrainedVector(3)])
      )
    ),
    normalize: new FunctionNode(
      "normalize",
      "Normalize a vector",
      signature(template(), [["in", template()]], genFDType)
    ),
    faceforward: new FunctionNode(
      "faceforward",
      "Face forward vector",
      signature(
        template(),
        [
          ["N", template()],
          ["I", template()],
          ["Nref", template()],
        ],
        genFDType
      )
    ),
    reflect: new FunctionNode(
      "reflect",
      "Reflect a vector",
      signature(
        template(),
        [
          ["I", template()],
          ["N", template()],
        ],
        genFDType
      )
    ),
    refract: new FunctionNode(
      "refract",
      "Refract a vector",
      signature(
        template(),
        [
          ["I", template()],
          ["N", template()],
          ["eta", templateOrComponent()],
        ],
        genFDType
      )
    ),
  },
});

const vectors = createCategory({
  id: "vectors",
  name: "Vectors",
  nodes: {
    getX: new GetMember("x", vector("float", 2), scalar("float")),
    getY: new GetMember("y", vector("float", 2), scalar("float")),

    decomposeVector,
  },
});

const uniforms = createCategory({
  id: "uniforms",
  name: "Uniforms",
  nodes: {
    time: new UniformNode(
      "time",
      "Elapsed time in seconds",
      "uTime",
      scalar("float")
    ),
    resolution: new UniformNode(
      "resolution",
      "Screen resolution",
      "uResolution",
      vector("float", 2)
    ),
    fragCoord: new UniformNode(
      "fragCoord",
      "Fragment coordinates",
      "gl_FragCoord",
      vector("float", 4)
    ),
    uv: new UniformNode("uv", "UV coordinates", "vUv", vector("float", 2)),
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
  functionsTrig,
  functionsVec,
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
  ...functionsTrig.nodes,
  ...functionsVec.nodes,
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
