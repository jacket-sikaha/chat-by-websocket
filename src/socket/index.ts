import { useLayoutEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { MessageBody, useChatMessageStore, useChatUsersStore } from '../store';

export const url = import.meta.env.DEV
  ? 'http://192.168.9.46:3000'
  : (import.meta.env.import.meta.env.VITE_ORIGIN_SERVER_BACKEND??undefined);

console.log('url:', import.meta.env.VITE_ORIGIN_SERVER);
export const socket = io(url, {
  autoConnect: false
});

export const useSocketService = () => {
  const [loading, setLoading] = useState(false);
  const timer = useRef<NodeJS.Timeout>();
  const me = useChatUsersStore.use.me();
  const setMe = useChatUsersStore.use.setMe();
  const setUsers = useChatUsersStore.use.setUsers();
  const addMsg = useChatMessageStore.use.handleMsgReceived();
  const onConnect = () => {
    console.log('me:', me);
    socket.id && setMe(socket.id);
    console.log('connected');
  };
  const onDisconnect = () => {
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

  const pollingSetUsers = () => {
    // if (!timer.current) {
    //   socket.emit('connected-users', '', (val: string[]) => {
    //     setUsers(val);
    //   });
    // }

    timer.current = setInterval(() => {
      socket.emit('connected-users', '', (val: string[]) => {
        setUsers(val);
      });
    }, 1000 * 30);
  };

  useLayoutEffect(() => {
    socket.connect();
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('msg', handleMsgReceived);
    socket.io.on('error', onError);
    pollingSetUsers();
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('msg', handleMsgReceived);
      socket.io.off('error', onError);
      clearInterval(timer.current);
    };
  }, []);

  return { loading, sendMsg };
};
