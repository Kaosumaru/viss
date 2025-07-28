import type { Type } from "@glsl/types/types";
import type { SocketReference } from "./socket";

export interface Connection {
  from: SocketReference;
  to: SocketReference;

  type?: Type;
}
