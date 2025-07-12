import { ClassicPreset, type GetSchemes } from "rete";
import type { ContextMenuExtra } from "rete-context-menu-plugin";
import type { ReactArea2D } from "rete-react-plugin";
import type { NodeA, NodeB } from "./nodes/test";

export type Node = NodeA | NodeB;
export type Schemes = GetSchemes<Node, Connection<Node, Node>>;
export type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;

class Connection<
  A extends Node,
  B extends Node
> extends ClassicPreset.Connection<A, B> {}
