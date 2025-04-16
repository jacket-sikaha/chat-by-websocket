import { UploadFile } from 'antd';
import { produce } from 'immer';
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
    set(
      produce((state: ChatUsers) => {
        state.users.push(user);
      })
    ),
  setMe: (user) =>
    set(() => ({
      me: user
    }))
}));

const useChatMessageStoreBase = create<ChatMessage>((set) => ({
  messages: [],
  handleMsgReceived: (message) =>
    set(
      produce((state: ChatMessage) => {
        state.messages.push(message);
      })
    )
}));

export const useChatUsersStore = createSelectors(useChatUsersStoreBase);
export const useChatMessageStore = createSelectors(useChatMessageStoreBase);
