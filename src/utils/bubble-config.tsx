import { ChatMsgType, MessageBody } from '@/store';
import { UserOutlined } from '@ant-design/icons';
import { FileCard } from '@ant-design/x';
import { RoleProps } from '@ant-design/x/es/bubble/interface';
import { Avatar, Flex, Progress, Tooltip, UploadFile } from 'antd';

export const commonRoleConfig = (isYour: boolean, avatar?: string): RoleProps => {
  return {
    placement: isYour ? 'end' : 'start',
    typing: { effect: 'typing', step: 10 },
    avatar: (
      <Tooltip title={isYour ? 'You' : avatar?.slice(0, 2)}>
        <Avatar
          icon={avatar?.slice(0, 2) ?? <UserOutlined />}
          style={isYour ? { background: '#fde3cf' } : undefined}
        />
      </Tooltip>
    )
  };
};

export type ChatContentType = {
  id: string | number;
  data: any;
};
export const AllContentType2Render = {
  [ChatMsgType.str]: (content: ChatContentType) => {
    return content.data;
  },
  [ChatMsgType.other]: (content: ChatContentType) => {
    return content.data;
  },
  [ChatMsgType.file]: (
    content: ChatContentType,
    action?: (
      item: UploadFile<any> & {
        fid: string;
      }
    ) => void
  ) => {
    return (
      <Flex vertical gap="middle">
        {(content.data as MessageBody['file'])?.map((item) => (
          <FileCard
            type="file"
            key={item.uid}
            onClick={() => action?.(item)}
            name={item.name}
            byte={item.size}
            description={
              item.status === 'uploading' ? (
                <Progress percent={item.percent} size="small" />
              ) : undefined
            }
          />
        ))}
      </Flex>
    );
  }
};
