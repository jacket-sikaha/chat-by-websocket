import { UploadFile } from 'antd';
import { produce } from 'immer';
import { create } from 'zustand';
import { createSelectors } from './utils';

export enum ChatMsgTyoe {
  str = 0,
  file,
  other = 2
}

export type MessageBody = {
  type: ChatMsgTyoe;
  str?: string;
  file?: (UploadFile & { fid: string })[];
  other?: any;
  from: string;
  source?: boolean; // 消息来源 ： 1 是发送者 / 0 接收者
};

interface ChatUsers {
  users: string[];
  me: string;
  setUsers: (users: string[]) => void;
  setMe: (user: string) => void;
}

interface ChatMessage {
  messages: MessageBody[];
  handleMsgReceived: (msg: MessageBody) => void;
}

const useChatUsersStoreBase = create<ChatUsers>((set) => ({
  users: [],
  me: '',
  setUsers: (users) =>
    set(() => {
      console.log('users1111:', users);
      return { users };
    }),
  setMe: (user) =>
    set(() => ({
      me: user
    }))
}));

const useChatMessageStoreBase = create<ChatMessage>((set) => ({
  messages: [],
  handleMsgReceived: (message) => {
    console.log('handleMsgReceived', message);
    set(
      produce((state: ChatMessage) => {
        state.messages.push(message);
      })
    );
  }
}));

export const useChatUsersStore = createSelectors(useChatUsersStoreBase);
export const useChatMessageStore = createSelectors(useChatMessageStoreBase);
