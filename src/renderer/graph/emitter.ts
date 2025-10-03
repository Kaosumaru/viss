import Emittery from "emittery";

export interface ConnectionDropperEvent {
  from: {
    nodeId: string;
    socketId: string;
  };
}

type Events = {
  connectionDroppedOnEmpty: ConnectionDropperEvent;
};

const emitter = new Emittery<Events>();

export default emitter;
