import mitt from "mitt";

export interface ConnectionDropperEvent {
  from: {
    nodeId: string;
    socketId: string;
  };
}

type Events = {
  connectionDroppedOnEmpty: ConnectionDropperEvent;
};

const emitter = mitt<Events>();

export default emitter;
