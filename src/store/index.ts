import request from '@/utils/request';
import { UploadFile } from 'antd';
import { produce } from 'immer';
import { create } from 'zustand';
import { createSelectors } from './utils';

export enum ChatMsgType {
  str = 0,
  file,
  other = 2
}

export type MessageBody = {
  id: string | number;
  type: ChatMsgType;
  str?: string;
  file?: (UploadFile & { fid: string })[];
  other?: any;
  from: string;
  source?: boolean; // 消息来源 ： 1 是发送者 / 0 接收者
};

interface ChatUsers {
  users: string[];
  online_users: string[];
  me: string;
  setUsers: (users: string[]) => void;
  setMe: (user: string) => void;
}

interface ChatMessage {
  messages: MessageBody[];
  handleMsgReceived: (msg: MessageBody) => void;
  downloadFile: (
    messageId: string,
    userId: string,
    file: UploadFile & { fid: string }
  ) => Promise<Blob | undefined>;
}

const useChatUsersStoreBase = create<ChatUsers>((set) => ({
  users: [],
  online_users: [],
  me: '',
  setUsers: (value) =>
    set(({ users }) => {
      const tmp = new Set([...users, ...value]);
      return { online_users: value, users: Array.from(tmp) };
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
  },
  downloadFile: async (messageId, userId, file) => {
    try {
      const data = await request.post(
        `/api/share-file/download-stream`,
        { userId, fid: file.fid },
        {
          timeout: 300 * 1000,
          responseType: 'blob',
          onDownloadProgress(progressEvent) {
            if (file.size && progressEvent.loaded && progressEvent.loaded > 0) {
              const percent = Math.round((progressEvent.loaded / file.size) * 100);
              set(
                produce((state: ChatMessage) => {
                  const target = state.messages.find(({ id }) => id === messageId);
                  if (target?.file) {
                    const obj = target.file.find((f) => f.fid === file.fid);
                    if (obj) {
                      if (file.size === progressEvent.loaded) {
                        obj.status = 'done';
                        return;
                      }
                      obj.status = 'uploading';
                      obj.percent = percent;
                    }
                  }
                })
              );
            }
          }
        }
      );
      return data as unknown as Blob;
    } catch (error) {
      console.log(error);
      return;
    }
  }
}));

export const useChatUsersStore = createSelectors(useChatUsersStoreBase);
export const useChatMessageStore = createSelectors(useChatMessageStoreBase);
