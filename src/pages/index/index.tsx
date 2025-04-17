import { Attachments, Bubble, Sender } from '@ant-design/x';
import React, { useState } from 'react';

import { CloudUploadOutlined, PaperClipOutlined, UserOutlined } from '@ant-design/icons';
import { Badge, Button, Flex, Typography, type GetProp } from 'antd';

const Independent: React.FC = () => {
  // ==================== State ====================
  const [headerOpen, setHeaderOpen] = useState(false);

  const [content, setContent] = useState('');

  const [attachedFiles, setAttachedFiles] = useState<GetProp<typeof Attachments, 'items'>>([]);
  const roles: GetProp<typeof Bubble.List, 'roles'> = {
    msg: {
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
    msg2: {
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
  // ==================== Event ====================
  const onSubmit = (nextContent: string) => {
    if (!nextContent) return;
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
      <Bubble.List
        items={[
          // Normal
          {
            key: 0,
            role: 'msg',
            content: 'Normal message'
          },

          // ReactNode
          {
            key: 1,
            role: 'msg',
            content: <Typography.Text type="danger">ReactNode message</Typography.Text>
          },

          {
            key: 10,
            role: 'msg2',
            content: 'Nor1111mal messa111111ge1111111'
            // footer: dayjs().format('YYYY-MM-DD HH:mm:ss')
          },
          // Role: file
          {
            key: 3,
            role: 'file',
            content: [
              {
                uid: '1',
                name: 'excel-file.xlsx',
                size: 111111111
              },
              {
                uid: '2',
                name: 'word-file.docx',
                size: 2222111122,
                status: 'error',
                percent: 23
              }
            ]
          },
          {
            key: 113,
            role: 'file2',
            content: [
              {
                uid: '1',
                name: 'excel-file.xlsx',
                size: 111111111
              }
            ]
          },
          {
            key: 11,
            role: 'msg',
            content: (
              <Typography.Text type="danger">
                Reac11111111111111tNode message111111111111111
              </Typography.Text>
            )
          }
        ]}
        roles={roles}
      />

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
