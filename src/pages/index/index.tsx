import { Attachments, Bubble, Sender } from '@ant-design/x';
import React, { useMemo, useRef, useState } from 'react';

import { downloadBlob } from '@/utils';
import { fileBubbleRoleConstructs, strBubbleRoleConstructs } from '@/utils/bubble-role';
import { CloudUploadOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Badge, Button, Flex, UploadFile, type GetProp } from 'antd';
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
    console.log('res----------:', res);
  } catch (error) {
    console.log('error:', error);
  }
};

const ChatPage: React.FC = () => {
  // ==================== State ====================
  const { loading, sendMsg } = useSocketService();
  const axiosCancel = useRef(new Map<string, AbortController>());
  const downloadingFile = useRef(new Set<string>());
  const me = useChatUsersStore.use.me();
  const users = useChatUsersStore.use.users();
  const messages = useChatMessageStore.use.messages();
  const downloadFile = useChatMessageStore.use.downloadFile();

  const roles: GetProp<typeof Bubble.List, 'roles'> = useMemo(() => {
    return Object.assign(
      {},
      ...users.map((u) => {
        let avatar = u.slice(0, 2);
        return {
          [`${u}-str`]: strBubbleRoleConstructs(u === me, avatar),
          [`${u}-file`]: fileBubbleRoleConstructs(u === me, avatar, ({ data, id }: any) => {
            return (
              <Flex vertical gap="middle">
                {(data as MessageBody['file'])?.map((item) => (
                  <div
                    key={item.uid}
                    onClick={async () => {
                      console.log('findDOMNode', item);
                      // onDownload(me, item.fid, item.type, item.name);
                      if (downloadingFile.current.has(item.uid)) return;
                      downloadingFile.current.add(item.uid);
                      const res = await downloadFile(id, me, item);
                      downloadingFile.current.delete(item.uid);
                      res && downloadBlob(res as Blob, item.type, item.fileName);
                    }}
                  >
                    <Attachments.FileCard item={item} />
                  </div>
                ))}
              </Flex>
            );
          })
        };
      })
    );
  }, [me, users]);

  const bubbleListItem = useMemo(() => {
    return messages.map((item) => {
      const { type, source, from, id } = item;
      const k = ChatMsgType[type] as keyof typeof ChatMsgType;
      return {
        key: id,
        role: `${source ? me : from}-${k}`,
        content: {
          id,
          data: item[k]
        }
      };
    });
  }, [messages]);

  const [content, setContent] = useState('');
  const [headerOpen, setHeaderOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<GetProp<typeof Attachments, 'items'>>([]);

  // ==================== Event ====================
  const onSubmit = (nextContent: string) => {
    if (!nextContent) return;
    sendMsg({
      id: Math.random(),
      type: ChatMsgType.str,
      str: nextContent,
      from: me
    });
    setContent('');
  };

  const handleFileChange: GetProp<typeof Attachments, 'onChange'> = (info) => {
    const flag = info.fileList.every((file) => file.status === 'done' || file.status === 'error');
    if (flag && info.fileList.length > 0) {
      const done = info.fileList.filter((file) => file.status === 'done');
      const tmp = done.map(({ xhr, response, originFileObj, ...obj }) => {
        return obj;
      });
      sendMsg({
        id: Math.random(),
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
      {/* 🌟 消息列表 */}
      <Bubble.List className="flex-1" items={bubbleListItem} roles={roles} />

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
