import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { MessageBody, useChatMessageStore, useChatUsersStore } from '../store';

export const url = import.meta.env.DEV ? 'http://192.168.9.46:3000' : undefined;
export const socket = io(url);

export const useSocketService = () => {
  const setMe = useChatUsersStore.use.setMe();
  const handleMsgReceived = useChatMessageStore.use.handleMsgReceived();
  const onConnect = () => {
    socket.id && setMe(socket.id);
    console.log('connected');
  };
  const onDisconnect = () => {
    setMe('');
    console.log('disconnected');
  };

  const sendMsg = (data: MessageBody) => {
    socket.emit('msg', data);
  };

  useEffect(() => {
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('msg', handleMsgReceived);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('msg', handleMsgReceived);
    };
  }, []);
  return { sendMsg };
};
