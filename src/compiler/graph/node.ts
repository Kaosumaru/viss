import type { Position } from "./position";
import type { Parameters } from "./parameter";

export interface Node {
  identifier: string;
  nodeType: string;
  position: Position;

  parameters: Parameters;
}
