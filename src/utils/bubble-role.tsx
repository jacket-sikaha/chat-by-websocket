import { UserOutlined } from '@ant-design/icons';

export const strBubbleRoleConstructs = (isYour: boolean, avatar?: string) => {
  const icon = !avatar ? <UserOutlined /> : null;
  const style = isYour ? { background: '#fde3cf' } : null;
  return {
    placement: isYour ? 'end' : 'start',
    typing: { step: 10 },
    avatar: { icon, children: avatar, style },
    messageRender: (item: any) => {
      return item.data;
    }
  };
};

export const fileBubbleRoleConstructs = (
  isYour: boolean,
  avatar?: string,
  messageRender?: (content: unknown) => React.ReactNode
) => {
  const icon = !avatar ? <UserOutlined /> : null;
  const style = isYour ? { background: '#fde3cf' } : null;
  return {
    placement: isYour ? 'end' : 'start',
    typing: { step: 10 },
    avatar: { icon, children: avatar, style },
    variant: 'outlined',
    messageRender
  };
};
