import type { Position } from "@graph/position";
import Emittery from "emittery";

export interface ConnectionDropperEvent {
  from: {
    nodeId: string;
    socketId: string;
  };
  position: Position;
}

type Events = {
  connectionDroppedOnEmpty: ConnectionDropperEvent;
};

const emitter = new Emittery<Events>();

export default emitter;
