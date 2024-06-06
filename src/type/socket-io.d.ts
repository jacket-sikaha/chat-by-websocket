export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  ["chat message"]: (msg: string | null) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
  ["chat message"]: (msg: string | null) => void;
  upload: (data: File, cb?: (status: any) => void) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}
