import { ChatMsgType, useChatMessageStore } from '@/store';
import { DownloadOutlined } from '@ant-design/icons';
import { Attachments } from '@ant-design/x';
import { Typography } from 'antd';
import { onDownload } from '../index';

function History() {
  const messages = useChatMessageStore.use.messages();

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center gap-3 p-3">
      {messages
        .filter(({ source }) => !!!source)
        .map((item, index) => {
          const { type, from } = item;
          const k = ChatMsgType[type] as keyof typeof ChatMsgType;
          const content = item[k];

          return (
            <div
              key={index}
              className="service-card group relative w-full shrink-0 cursor-pointer snap-start overflow-hidden rounded-lg bg-[#fafafa] p-6 shadow-xl transition-all duration-300 hover:bg-[#07689f]"
            >
              <span className="absolute right-0 top-0 z-0 size-10 transform rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-75 transition-all duration-500 group-hover:scale-[20]" />
              <span className="absolute right-0 top-0 z-10 flex size-10 items-center justify-center text-lg text-white">
                {index + 1}
              </span>
              <div className="z-10 flex flex-col items-start gap-3 px-2">
                {Array.isArray(content) ? (
                  <div className="flex flex-wrap items-center gap-2 text-black/80 group-hover:text-white">
                    {content?.map((item) => (
                      <div key={item.uid}>
                        <Attachments.FileCard item={item} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography.Text
                    copyable
                    className="text-lg text-black/80 group-hover:text-white"
                  >
                    {content}
                  </Typography.Text>
                )}

                <div className="flex w-full items-center justify-between">
                  <div>
                    {Array.isArray(content) && (
                      <DownloadOutlined
                        className="rounded-full bg-[#a2d5f2] p-1.5 text-lg text-white"
                        onClick={() => {
                          Promise.all(
                            content.map((file) => onDownload(from, file.fid, file.type, file.name))
                          );
                        }}
                      />
                    )}
                  </div>
                  <p
                    style={{ WebkitTextStroke: '1px #ff7e67', WebkitTextFillColor: 'transparent' }}
                    className="z-10 self-end font-bold"
                  >
                    <span className="italic">From: </span> {from}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default History;
