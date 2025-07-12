export interface Socket {
  identifier: string;
  label: string;
}

export interface Sockets {
  [key: string]: Socket;
}

export function socket(id: string, label: string): Socket {
  return {
    identifier: id,
    label: label,
  };
}

export interface SocketReference {
  nodeId: string;
  socketId: string;
}
