import { Attachments, Bubble, BubbleItemType, Sender } from '@ant-design/x';
import React, { useMemo, useRef, useState } from 'react';

import { downloadBlob } from '@/utils';
import { AllContentType2Render, commonRoleConfig } from '@/utils/bubble-config';
import { CloudUploadOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Badge, Button, Spin, UploadFile, type GetProp } from 'antd';
import { v4 } from 'uuid';
import { customUploadFileReq, downloadFileReq } from '../../services/file';
import { useSocketService } from '../../socket';
import { ChatMsgType, MessageBody, useChatMessageStore, useChatUsersStore } from '../../store';

export const onDownload = async (
  userId: string,
  fid: string,
  type = 'application/octet-stream',
  filename?: string
) => {
  try {
    const res = await downloadFileReq(userId, fid);
    downloadBlob(res as Blob, type, filename);
  } catch (error) {
    console.log('error:', error);
  }
};

const ChatPage: React.FC = () => {
  // ==================== State ====================
  const { loading, connecting, reconnectAttempt, sendMsg } = useSocketService();
  const axiosCancel = useRef(new Map<string, AbortController>());
  const downloadingFile = useRef(new Set<string>());
  const socketIds = useChatUsersStore.use.socketIds();
  const me = socketIds[socketIds.length - 1] ?? '';
  const uid = useChatUsersStore.use.id();
  const users = useChatUsersStore.use.users();
  const messages = useChatMessageStore.use.messages();
  const downloadFile = useChatMessageStore.use.downloadFile();

  const roles: GetProp<typeof Bubble.List, 'role'> = useMemo(() => {
    return Object.assign(
      {},
      ...users.map((u) => {
        // 使用临时uuid来判别是否是自己发的消息
        // 避免重连时自己消息归类成他人消息
        const isMe = socketIds.includes(u);
        const avatar = isMe ? uid : u;
        const k = isMe ? uid : u;
        return {
          [`${k}-str`]: commonRoleConfig(isMe, avatar),
          [`${k}-file`]: { ...commonRoleConfig(isMe, avatar), variant: 'outlined' }
        };
      })
    );
  }, [me, users]);

  const bubbleListItem: BubbleItemType[] = useMemo(() => {
    return messages.map((item) => {
      const { type, source, from, id } = item;
      const k = ChatMsgType[type] as keyof typeof ChatMsgType;
      return {
        key: id,
        role: `${source ? uid : from}-${k}`, // 与roles里的消息key要对应
        content: {
          id,
          data: item[k]
        },
        contentRender: (c) =>
          AllContentType2Render[type](c, async (item) => {
            if (downloadingFile.current.has(item.uid)) return;
            downloadingFile.current.add(item.uid);
            const res = await downloadFile(id.toString(), me, item);
            downloadingFile.current.delete(item.uid);
            console.log('res----------:', item);
            res && downloadBlob(res as Blob, item.type, item.name ?? item.fileName);
          })
      };
    });
  }, [me, messages, uid]);

  const [content, setContent] = useState('');
  const [headerOpen, setHeaderOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<GetProp<typeof Attachments, 'items'>>([]);

  // ==================== Event ====================
  const onSubmit = (nextContent: string) => {
    if (!nextContent) return;
    sendMsg({
      id: v4(),
      type: ChatMsgType.str,
      str: nextContent,
      from: me
    });
    setContent('');
  };

  const handleFileChange: GetProp<typeof Attachments, 'onChange'> = (info) => {
    const flag = info.fileList.every((file) => file.status === 'done' || file.status === 'error');
    const done = info.fileList.filter((file) => file.status === 'done');
    if (flag && done.length > 0) {
      const tmp = done.map(({ xhr, response, originFileObj, ...obj }) => {
        return obj;
      });
      sendMsg({
        id: v4(),
        type: ChatMsgType.file,
        file: tmp as MessageBody['file'],
        from: me
      });
      setTimeout(() => {
        setAttachedFiles([]);
        setHeaderOpen(false);
      }, 1000);
      return;
    }
    setAttachedFiles(info.fileList);
  };

  const attachmentsNode = (
    <Badge dot={attachedFiles.length > 0 && !headerOpen}>
      <Button type="text" icon={<PaperClipOutlined />} onClick={() => setHeaderOpen(!headerOpen)} />
    </Badge>
  );

  const senderHeader = (
    <Sender.Header
      title="Attachments"
      open={headerOpen}
      onOpenChange={setHeaderOpen}
      styles={{
        content: {
          padding: 0
        }
      }}
    >
      <Attachments
        // beforeUpload={() => false}
        multiple
        maxCount={3}
        items={attachedFiles}
        onChange={handleFileChange}
        customRequest={async (options) => {
          const file = options.file as UploadFile;
          const cancel = customUploadFileReq(options, me);
          axiosCancel.current.set(file.uid, cancel);
        }}
        onRemove={(file) => {
          setAttachedFiles((prev) => prev.filter((item) => item.uid !== file.uid));
          axiosCancel.current.get(file.uid)?.abort();
          axiosCancel.current.delete(file.uid);
        }}
        placeholder={(type) =>
          type === 'drop'
            ? { title: 'Drop file here' }
            : {
                icon: <CloudUploadOutlined />,
                title: 'Upload files',
                description: 'Click or drag files to this area to upload'
              }
        }
      />
    </Sender.Header>
  );

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-3 bg-white p-6">
      <Spin
        spinning={connecting || !!reconnectAttempt}
        tip={
          <div className="text-base">
            {reconnectAttempt ? `尝试第${reconnectAttempt}次重连...` : '正在连接中...'}
          </div>
        }
        delay={500}
        size="large"
        fullscreen
      />
      {/* 🌟 消息列表 */}
      <Bubble.List className="flex-1" items={bubbleListItem} role={roles} />

      {/* 🌟 输入框 */}
      <Sender
        className=""
        value={content}
        header={senderHeader}
        onSubmit={onSubmit}
        onChange={setContent}
        prefix={attachmentsNode}
        loading={loading}
      />
    </div>
  );
};

export default ChatPage;
