import { FileSocketData } from "./socket-io";

export interface WsMessage {
  type: MsgType;
  data: string | FileSocketData;
}

export enum MsgType {
  TEXT = 0,
  FILE = 1,
}
