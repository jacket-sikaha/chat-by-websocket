import { useLayoutEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { MessageBody, useChatMessageStore, useChatUsersStore } from '../store';

export const url = import.meta.env.DEV ? 'http://192.168.9.46:3000' : undefined;
console.log('url:', import.meta.env.VITE_ORIGIN_SERVER);
export const socket = io(url, {
  autoConnect: false
});

export const useSocketService = () => {
  const [loading, setLoading] = useState(false);
  const setMe = useChatUsersStore.use.setMe();
  const addMsg = useChatMessageStore.use.handleMsgReceived();
  const onConnect = () => {
    socket.id && setMe(socket.id);
    console.log('connected');
  };
  const onDisconnect = () => {
    setMe('');
    console.log('disconnected');
  };

  const onError = (err: any) => {
    console.log('connect_error due to ', err);
  };
  const sendMsg = (data: MessageBody) => {
    setLoading(true);
    socket.emit('msg', data);
  };

  const handleMsgReceived = (message: MessageBody) => {
    addMsg(message);
    setLoading(false);
  };

  useLayoutEffect(() => {
    socket.connect();
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('msg', handleMsgReceived);
    socket.io.on('error', onError);
    return () => {
      socket.disconnect();
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('msg', handleMsgReceived);
      socket.io.off('error', onError);
    };
  }, []);
  return { loading, sendMsg };
};
