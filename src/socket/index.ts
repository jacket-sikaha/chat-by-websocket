import { App } from 'antd';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { MessageBody, useChatMessageStore, useChatUsersStore } from '../store';

export const url = import.meta.env.DEV ? undefined : import.meta.env.VITE_ORIGIN_SERVER;

console.log('url:', import.meta.env.VITE_ORIGIN_SERVER);
export const socket = io(url, {
  autoConnect: false
});

export const useSocketService = () => {
  const { message, modal } = App.useApp();
  const [connecting, setConnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const attempt = useRef(0);
  const [loading, setLoading] = useState(false);
  const timer = useRef<NodeJS.Timeout>();
  const setSocketIds = useChatUsersStore.use.setSocketIds();
  const setUsers = useChatUsersStore.use.setUsers();
  const addMsg = useChatMessageStore.use.handleMsgReceived();
  const synchronizeOnlinePeople = (val: string[]) => {
    setUsers(val);
  };

  const onConnect = async () => {
    setConnecting(() => false);
    // setReconnectAttempt里面的回调函数执行还是属于异步范畴
    // 1. 用Promise异步转同步，resolve传递最新值
    // 2. ref记录最新值
    // await new Promise((resolve, reject) => {
    //   setReconnectAttempt((num) => {
    //     console.log('num111111111111:', num, attempt.current);
    //     // num > 0 说明之前进行过重连
    //     resolve(num > 0);
    //     return 0;
    //   });
    // }).then((reconnection) => {
    //   if (reconnection) message.success('重连成功');
    // });
    if (attempt.current) message.success('重连成功');
    setReconnectAttempt(() => 0);
    socket.id && setSocketIds(socket.id);
    // 连接成功后全部在线用户同步在线的socket id
    socket.emit('connected-users', { broadcast: true }, synchronizeOnlinePeople);
    console.log('connected', socket.id);
    console.log(useChatUsersStore.getState());
  };
  const onDisconnect = (reason: string, description: any) => {
    modal.error({
      title: '连接断开',
      content: reason
    });
    console.error('disconnected', {
      reason,
      description
    });
  };

  const onError = (err: any) => {
    setConnecting(() => false);
    console.log('connect_error due to ', err);
  };

  const onReconnectAttempt = (attempt: number) => {
    if (attempt > 10) {
      message.error('重连失败');
      setReconnectAttempt(() => 0);
      return;
    }
    setReconnectAttempt(() => attempt);
    console.warn('reconnect_attempt:', attempt);
  };

  const sendMsg = (data: MessageBody) => {
    if (!socket.connected) {
      message.error('socket 未连接');
      return;
    }
    setLoading(true);
    socket.emit('msg', data);
  };

  const handleMsgReceived = (message: MessageBody) => {
    addMsg(message);
    setLoading(false);
  };

  const pollingSetUsers = () => {
    timer.current = setInterval(() => {
      socket.emit('connected-users', '', synchronizeOnlinePeople);
    }, 1000 * 10);
  };

  useEffect(() => {
    attempt.current = reconnectAttempt;
  }, [reconnectAttempt]);

  useLayoutEffect(() => {
    if (!socket.connected) {
      setConnecting(() => true);
      socket.connect();
    }
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('msg', handleMsgReceived);
    socket.on('connected-users', synchronizeOnlinePeople);
    socket.io.on('error', onError);
    socket.io.on('reconnect_attempt', onReconnectAttempt);

    pollingSetUsers();
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('msg', handleMsgReceived);
      socket.off('connected-users', synchronizeOnlinePeople);
      socket.io.off('error', onError);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      clearInterval(timer.current);
    };
  }, []);

  return { loading, connecting, reconnectAttempt, sendMsg };
};
