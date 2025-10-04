import type { Position } from "@graph/position";
import Emittery from "emittery";

export interface SocketRef {
  nodeId: string;
  socketId: string;
}

export interface ConnectionDropperEvent {
  from: SocketRef;
  position: Position;
}

type Events = {
  connectionDroppedOnEmpty: ConnectionDropperEvent;
};

const emitter = new Emittery<Events>();

export default emitter;
