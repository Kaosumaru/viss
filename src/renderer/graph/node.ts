import { ClassicPreset, type GetSchemes } from "rete";
import type { ContextMenuExtra } from "rete-context-menu-plugin";
import type { ReactArea2D } from "rete-react-plugin";
import type { UICompilerNode } from "./nodes/compilerNode";
import type { Type } from "@glsl/types";

export type Node = UICompilerNode;
export type Schemes = GetSchemes<Node, Connection<Node, Node>>;
export type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;

class Connection<
  A extends Node,
  B extends Node
> extends ClassicPreset.Connection<A, B> {
  type?: Type;
}
