import type { Type } from "@glsl/types";
import type { SocketReference } from "./socket";

export interface Connection {
  from: SocketReference;
  to: SocketReference;

  type?: Type;
}
