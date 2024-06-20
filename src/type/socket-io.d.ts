export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  ["chat message"]: (msg: string | null) => void;
  upload: (file: FileSocketData) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
  ["chat message"]: (msg: string | null) => void;
  upload: (
    data: FileSocketData,
    cb?: (status: any, file: FileSocketData) => void
  ) => void;
  ["download-file"]: (data: FileSocketData, cb?: (data: any) => void) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}

export interface FileSocketData {
  name: string;
  originName?: string;
  size: number;
  type: string;
  data: ArrayBuffer;
  uuid?: number;
}
