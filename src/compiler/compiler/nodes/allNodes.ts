import { scalar, vector } from "@glsl/types";
import { LiteralNode } from "./basic/literal";
import type { CompilerNode } from "./compilerNode";
import { add } from "./operators/add";
import { substract } from "./operators/substract";
import { preview } from "./out/preview";
import { sin } from "./functions/sin";
import { UniformNode } from "./uniforms/uniform";
import { abs } from "./functions/abs";
import { divide } from "./operators/divide";
import { GetMember } from "./vector/getMember";
import { composeVector4 } from "./vector/composeVector4";

export const nodes = {
  float: new LiteralNode(scalar("float")),

  // vector2: new LiteralNode(vector("float", 2)),
  // vector3: new LiteralNode(vector("float", 3)),
  // vector4: new LiteralNode(vector("float", 4)),

  add,
  substract,
  divide,

  preview,

  sin,
  abs,

  time: new UniformNode("u_time", scalar("float")),
  fragCoord: new UniformNode("gl_FragCoord", vector("float", 2)),

  getX: new GetMember("x"),
  getY: new GetMember("y"),

  composeVector4,
};

export type NodeType = keyof typeof nodes;
export function getNode(type: NodeType): CompilerNode {
  const node = nodes[type];
  if (!node) {
    throw new Error(`Node type "${type}" not found`);
  }
  return node;
}
