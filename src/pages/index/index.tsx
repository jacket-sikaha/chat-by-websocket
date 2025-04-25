import { Attachments, Bubble, Sender } from '@ant-design/x';
import React, { useMemo, useState } from 'react';

import { downloadBlob } from '@/utils';
import { fileBubbleRoleConstructs, strBubbleRoleConstructs } from '@/utils/bubble-role';
import { CloudUploadOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Badge, Button, Flex, type GetProp } from 'antd';
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

  const me = useChatUsersStore.use.me();
  const users = useChatUsersStore.use.users();
  const messages = useChatMessageStore.use.messages();

  const roles: GetProp<typeof Bubble.List, 'roles'> = useMemo(() => {
    return Object.assign(
      {},
      ...users.map((u) => {
        let avatar = u.slice(0, 2);
        return {
          [`${u}-str`]: strBubbleRoleConstructs(u === me, avatar),
          [`${u}-file`]: fileBubbleRoleConstructs(u === me, avatar, (items: any) => (
            <Flex vertical gap="middle">
              {(items as MessageBody['file'])?.map((item) => (
                <div
                  key={item.uid}
                  onClick={() => {
                    console.log('findDOMNode', item);
                    onDownload(me, item.fid, item.type, item.name);
                  }}
                >
                  <Attachments.FileCard item={item} />
                </div>
              ))}
            </Flex>
          ))
        };
      })
    );
  }, [me, users]);

  const bubbleListItem = useMemo(() => {
    return messages.map((item, i) => {
      const { type, source, from } = item;
      const k = ChatMsgType[type] as keyof typeof ChatMsgType;
      return {
        key: i,
        role: `${source ? me : from}-${k}`,
        content: item[k]
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
      type: ChatMsgType.str,
      str: nextContent,
      from: me
    });
    setContent('');
  };

  const handleFileChange: GetProp<typeof Attachments, 'onChange'> = (info) => {
    const flag = info.fileList.every((file) => file.status === 'done');
    if (flag) {
      const tmp = info.fileList.map(({ xhr, response, originFileObj, ...obj }) => {
        return obj;
      });
      sendMsg({
        type: ChatMsgType.file,
        file: tmp as MessageBody['file'],
        from: me
      });
      setHeaderOpen(false);
      setAttachedFiles([]);
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
          const res = await customUploadFileReq(options, me);
          console.log('res========:', res, attachedFiles);
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
