import type { Position } from "@graph/position";
import Emittery from "emittery";
import { useEffect } from "react";

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

export function useEmitter(
  name: keyof Events,
  handler: (event: Events[keyof Events]) => Promise<void> | void
) {
  useEffect(() => {
    emitter.on(name, handler);
    return () => {
      emitter.off(name, handler);
    };
  }, [name, handler]);
}
