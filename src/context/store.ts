import { WsMessage } from "@/type/ws-message";
import { createContext, useContext } from "react";

export type MsgStoreType = {
  msgList: WsMessage[];
  AddMsgList(item: WsMessage): void;
};

export const MsgStore = createContext<MsgStoreType>({
  msgList: [],
  AddMsgList: function (msgList: WsMessage): void {
    throw new Error("Function not implemented.");
  },
});

export const useMsgStore = () => {
  return useContext(MsgStore);
};
