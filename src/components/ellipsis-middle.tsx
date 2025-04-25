import { Typography } from 'antd';
import { TextProps } from 'antd/es/typography/Text';
import React from 'react';

const { Text } = Typography;

export const EllipsisMiddle: React.FC<{ suffixCount: number; children: string } & TextProps> = ({
  suffixCount,
  children
}) => {
  const start = children.slice(0, children.length - suffixCount);
  const suffix = children.slice(-suffixCount).trim();
  return (
    <Text style={{ maxWidth: '100%' }} ellipsis={{ suffix }} copyable>
      {start}
    </Text>
  );
};
