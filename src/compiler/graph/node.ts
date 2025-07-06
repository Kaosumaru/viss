import type { Position } from "./position";
import type { Socket } from "./socket";

export interface Node {
  identifier: string;
  label: string;
  position: Position;

  inputs: Socket[];
  outputs: Socket[];
}
