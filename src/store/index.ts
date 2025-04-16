import { UploadFile } from 'antd';
import { create } from 'zustand';
import { createSelectors } from './utils';

enum ChatMsgTyoe {
  str = 0,
  file,
  other = 2
}

type MessageBody = {
  type: ChatMsgTyoe;
  str?: string;
  file?: UploadFile[];
  from: string;
};

interface ChatUsers {
  users: string[];
  me: string;
  addUser: (user: string) => void;
  setMe: (user: string) => void;
}

interface ChatMessage {
  messages: MessageBody[];
  handleMsgReceived: (msg: MessageBody) => void;
}

const useChatUsersStoreBase = create<ChatUsers>((set) => ({
  users: [],
  me: '',
  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user]
    })),
  setMe: (user: any) =>
    set(() => ({
      me: user
    }))
}));

const useChatMessageStoreBase = create<ChatMessage>((set) => ({
  messages: [],
  handleMsgReceived: (message) =>
    set((state) => ({
      messages: [...state.messages, message]
    }))
}));

export const useChatUsersStore = createSelectors(useChatUsersStoreBase);
export const useChatMessageStore = createSelectors(useChatMessageStoreBase);
