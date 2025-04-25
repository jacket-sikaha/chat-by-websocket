import { ChatMsgType, useChatMessageStore } from '@/store';
import { DownloadOutlined } from '@ant-design/icons';
import { Attachments } from '@ant-design/x';
import { Typography } from 'antd';
import { onDownload } from '../index';

function History() {
  const messages = useChatMessageStore.use.messages();
  messages;
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 p-3">
      {messages.map((item, index) => {
        const { type, file, from } = item;
        const k = ChatMsgType[type] as keyof typeof ChatMsgType;
        const content = item[k];

        return (
          <div
            key={index}
            className="service-card group flex w-full shrink-0 cursor-pointer snap-start flex-col items-start gap-3 rounded-lg bg-white p-6 shadow-xl transition-all duration-300 hover:bg-[#006e25]"
          >
            {Array.isArray(content) ? (
              <div className="flex flex-wrap items-center gap-2">
                {content?.map((item) => (
                  <div key={item.uid}>
                    <Attachments.FileCard item={item} />
                  </div>
                ))}
              </div>
            ) : (
              <Typography.Text copyable className="text-lg text-black/80 group-hover:text-white">
                {content}
              </Typography.Text>
            )}

            <div className="flex w-full items-center justify-between">
              <div>
                {Array.isArray(content) && (
                  <DownloadOutlined
                    className="rounded-full bg-[#736DD3] p-1.5 text-lg text-black/80 group-hover:text-white"
                    onClick={() => {
                      Promise.all(
                        content.map((file) => onDownload(from, file.fid, file.type, file.name))
                      );
                    }}
                  />
                )}
              </div>
              <p
                style={{ WebkitTextStroke: '1px #A66216', WebkitTextFillColor: 'transparent' }}
                className="self-end font-bold"
              >
                <span className="italic">From: </span> {from}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default History;
