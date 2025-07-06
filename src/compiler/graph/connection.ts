import type { SocketReference } from "./socket";

export interface Connection {
  from: SocketReference;
  to: SocketReference;
}
