import { scalar, vector } from "@glsl/types";
import { LiteralNode } from "./basic/literal";
import type { CompilerNode } from "./compilerNode";
import { add } from "./operators/add";
import { substract } from "./operators/substract";
import { preview } from "./out/preview";

export const nodes = {
  float: new LiteralNode(scalar("float")),

  vector2: new LiteralNode(vector("float", 2)),
  vector3: new LiteralNode(vector("float", 3)),
  vector4: new LiteralNode(vector("float", 4)),

  add,
  substract,

  preview,
};

export type NodeType = keyof typeof nodes;
export function getNode(type: NodeType): CompilerNode {
  const node = nodes[type];
  if (!node) {
    throw new Error(`Node type "${type}" not found`);
  }
  return node;
}
