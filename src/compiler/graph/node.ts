import type { Position } from "./position";
import type { Sockets } from "./socket";
import type { Parameters } from "./parameter";

export interface Node {
  identifier: string;
  label: string;
  position: Position;

  parameters: Parameters;
  inputs: Sockets;
  outputs: Sockets;
}
