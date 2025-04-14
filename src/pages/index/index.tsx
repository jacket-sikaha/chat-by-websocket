import { Attachments, Bubble, Sender, useXAgent, useXChat } from '@ant-design/x';
import React, { useEffect, useState } from 'react';

import { CloudUploadOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Badge, Button, type GetProp } from 'antd';
import { produce } from 'immer';

const defaultConversationsItems = [
  {
    key: '0',
    label: 'What is Ant Design X?'
  }
];

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    typing: { step: 5, interval: 20 },
    styles: {
      content: {
        borderRadius: 16
      }
    }
  },
  local: {
    placement: 'end',
    variant: 'shadow'
  }
};

const Independent: React.FC = () => {
  // ==================== State ====================
  const [headerOpen, setHeaderOpen] = useState(false);

  const [content, setContent] = useState('');

  const [activeKey, setActiveKey] = useState(defaultConversationsItems[0].key);

  const [attachedFiles, setAttachedFiles] = useState<GetProp<typeof Attachments, 'items'>>([]);

  const [aaa, setAaa] = useState(2);
  const [bbb, setBbb] = useState([{ a: 0 }, { a: 4 }]);

  const tmp = produce((draft, num) => {
    draft.push({ a: num });
  });
  const add = (num = 33) => {
    setBbb((base) => tmp(base, num));
  };
  // ==================== Runtime ====================
  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess }) => {
      onSuccess(`Mock success return. You said: ${message}`);
    }
  });

  const { onRequest, messages, setMessages } = useXChat({
    agent
  });

  useEffect(() => {
    if (activeKey !== undefined) {
      setMessages([]);
    }
  }, [activeKey]);

  useEffect(() => {
    console.log('update===================');
  }, [aaa]);
  // ==================== Event ====================
  const onSubmit = (nextContent: string) => {
    if (!nextContent) return;
    onRequest(nextContent);
    setContent('');
  };

  const handleFileChange: GetProp<typeof Attachments, 'onChange'> = (info) =>
    setAttachedFiles(info.fileList);

  const items: GetProp<typeof Bubble.List, 'items'> = messages.map(({ id, message, status }) => ({
    key: id,
    loading: status === 'loading',
    role: status === 'local' ? 'local' : 'ai',
    content: message
  }));

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
        beforeUpload={() => false}
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

  const logoNode = (
    <div>
      <img
        src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
        draggable={false}
        alt="logo"
      />
      <span>Ant Design X</span>
    </div>
  );

  // ==================== Render =================
  return (
    <div>
      <div>
        {/* 🌟 Logo */}
        {logoNode}
      </div>
      <div>
        {/* 🌟 消息列表 */}
        <Bubble.List items={items} roles={roles} />

        {/* 🌟 输入框 */}
        <Sender
          value={content}
          header={senderHeader}
          onSubmit={onSubmit}
          onChange={setContent}
          prefix={attachmentsNode}
          loading={agent.isRequesting()}
        />
        <div
          className="text-xl"
          onClick={() => {
            console.log('onClick:');
            setAaa(1);
          }}
        >
          {aaa}
        </div>
        <div
          className="text-xl"
          onClick={() => {
            add(Math.random() * 1000);
          }}
        >
          {JSON.stringify(bbb)}
        </div>
      </div>
    </div>
  );
};

export default Independent;
