import { Attachments, Bubble, Sender } from '@ant-design/x';
import React, { useState } from 'react';

import { CloudUploadOutlined, PaperClipOutlined, UserOutlined } from '@ant-design/icons';
import { Badge, Button, Flex, type GetProp } from 'antd';
import { useSocketService } from '../../socket';
import { ChatMsgTyoe, useChatMessageStore, useChatUsersStore } from '../../store';

const Independent: React.FC = () => {
  const roles: GetProp<typeof Bubble.List, 'roles'> = {
    str: {
      placement: 'end',
      typing: true,
      avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } }
    },
    file: {
      placement: 'end',
      avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
      variant: 'outlined',
      messageRender: (items: any) => (
        <Flex vertical gap="middle">
          {(items as any[]).map((item) => (
            <Attachments.FileCard key={item.uid} item={item} />
          ))}
        </Flex>
      )
    },
    str2: {
      placement: 'start',
      typing: true,
      avatar: { icon: <UserOutlined /> }
    },
    file2: {
      placement: 'start',
      avatar: { icon: <UserOutlined /> },
      variant: 'outlined',
      messageRender: (items: any) => (
        <Flex vertical gap="middle">
          {(items as any[]).map((item) => (
            <Attachments.FileCard key={item.uid} item={item} />
          ))}
        </Flex>
      )
    }
  };
  // ==================== State ====================
  const { sendMsg } = useSocketService();

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
  console.log('bubbleListItem:', bubbleListItem);
  const [content, setContent] = useState('');
  const [headerOpen, setHeaderOpen] = useState(false);

  const [attachedFiles, setAttachedFiles] = useState<GetProp<typeof Attachments, 'items'>>([]);

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

  const handleFileChange: GetProp<typeof Attachments, 'onChange'> = (info) =>
    setAttachedFiles(info.fileList);

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

        items={attachedFiles}
        onChange={handleFileChange}
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

  // ==================== Render =================
  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col gap-3 p-3">
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
        // loading={agent.isRequesting()}
      />
    </div>
  );
};

export default Independent;
