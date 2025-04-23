import { Attachments, Bubble, Sender } from '@ant-design/x';
import React, { useState } from 'react';

import { downloadBlob } from '@/utils';
import { CloudUploadOutlined, PaperClipOutlined, UserOutlined } from '@ant-design/icons';
import { Badge, Button, Flex, type GetProp } from 'antd';
import { customUploadFileReq, downloadFileReq } from '../../services/file';
import { useSocketService } from '../../socket';
import { ChatMsgTyoe, MessageBody, useChatMessageStore, useChatUsersStore } from '../../store';

const ChatPage: React.FC = () => {
  // ==================== State ====================
  const { loading, sendMsg } = useSocketService();

  const me = useChatUsersStore.use.me();
  const messages = useChatMessageStore.use.messages();
  const bubbleListItem = messages.map((item, i) => {
    const k = ChatMsgTyoe[item.type] as keyof typeof ChatMsgTyoe;
    return {
      key: i,
      role: `${k}${item.source ? '' : '2'}`,
      content: item[k]
    };
  });

  const [content, setContent] = useState('');
  const [headerOpen, setHeaderOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<GetProp<typeof Attachments, 'items'>>([]);
  const roles: GetProp<typeof Bubble.List, 'roles'> = {
    str: {
      placement: 'end',
      typing: { step: 10 },
      avatar: { icon: <UserOutlined />, children: 'asdasd', style: { background: '#fde3cf' } }
    },
    file: {
      placement: 'end',
      avatar: { icon: <UserOutlined />, children: me, style: { background: '#fde3cf' } },
      variant: 'outlined',
      messageRender: (items: any) => (
        <Flex vertical gap="middle">
          {(items as MessageBody['file'])?.map((item) => (
            <div
              key={item.uid}
              onClick={() => {
                console.log('findDOMNode', item);
                onDownload(item.fid, item.type, item.name);
              }}
            >
              <Attachments.FileCard item={item} />
            </div>
          ))}
        </Flex>
      )
    },
    str2: {
      placement: 'start',
      typing: { step: 10 },
      avatar: { icon: <UserOutlined /> }
    },
    file2: {
      placement: 'start',
      avatar: { icon: <UserOutlined /> },
      variant: 'outlined',
      messageRender: (items: any) => (
        <Flex vertical gap="middle">
          {(items as MessageBody['file'])?.map((item) => (
            <div
              key={item.uid}
              onClick={() => {
                console.log('findDOMNode', item.fid);
                onDownload(item.fid, item.type, item.name);
              }}
            >
              <Attachments.FileCard item={item} />
            </div>
          ))}
        </Flex>
      )
    }
  };
  // ==================== Event ====================
  const onSubmit = (nextContent: string) => {
    if (!nextContent) return;
    sendMsg({
      type: ChatMsgTyoe.str,
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
        type: ChatMsgTyoe.file,
        file: tmp as MessageBody['file'],
        from: me
      });
      setHeaderOpen(false);
      setAttachedFiles([]);
      return;
    }
    setAttachedFiles(info.fileList);
  };

  const onDownload = async (fid: string, type = 'application/octet-stream', filename?: string) => {
    try {
      const res = await downloadFileReq(me, fid);
      downloadBlob(res as Blob, type, filename);
      console.log('res----------:', res);
    } catch (error) {
      console.log('error:', error);
    }
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
