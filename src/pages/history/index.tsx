import { useMessageSubscription } from '@/socket';
import { ChatMsgType, MessageBody, useChatMessageStore, useChatUsersStore } from '@/store';
import { downloadBlob } from '@/utils';
import { DownloadOutlined } from '@ant-design/icons';
import { FileCard } from '@ant-design/x';
import { Progress, Typography } from 'antd';
import { useRef } from 'react';

function History() {
  const messages = useChatMessageStore.use.messages();
  const downloadFile = useChatMessageStore.use.downloadFile();
  const downloadingFile = useRef(new Set<string | number>());
  const socketIds = useChatUsersStore.use.socketIds();
  const me = socketIds[socketIds.length - 1] ?? '';
  useMessageSubscription();

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center gap-3 p-3">
      {messages
        .filter(({ source }) => !source)
        .map((item, index) => {
          const { id, type, from } = item;
          const k = ChatMsgType[type] as keyof typeof ChatMsgType;
          const content = item[k];
          const isFile = Array.isArray(content);
          return (
            <div
              key={index}
              className="service-card group relative w-full shrink-0 cursor-pointer snap-start overflow-hidden rounded-lg bg-[#fafafa] p-6 shadow-xl transition-all duration-300 hover:bg-[#07689f]"
            >
              <span className="absolute right-0 top-0 z-0 size-10 transform rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-75 transition-all duration-500 group-hover:scale-[3]" />
              <span className="absolute right-0 top-0 z-10 flex size-10 items-center justify-center text-lg text-white">
                {index + 1}
              </span>
              <div className="z-10 flex flex-col items-start gap-3 px-2">
                {isFile ? (
                  <div className="flex flex-wrap items-center gap-2 text-black/80 group-hover:text-white">
                    {(content as MessageBody['file'])?.map((item) => (
                      <div key={item.uid}>
                        <FileCard
                          type="file"
                          name={item.name}
                          byte={item.size}
                          description={
                            item.status === 'uploading' ? (
                              <Progress percent={item.percent} size="small" />
                            ) : undefined
                          }
                        />
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
                    {isFile && (
                      <DownloadOutlined
                        className="rounded-full bg-[#a2d5f2] p-1.5 text-lg text-white"
                        onClick={async () => {
                          if (downloadingFile.current.has(id)) return;
                          downloadingFile.current.add(id);
                          const actions = (content as MessageBody['file'])?.map((file) =>
                            downloadFile(id.toString(), me, file).then((res) => {
                              res &&
                                downloadBlob(res as Blob, file.type, file.name ?? file.fileName);
                            })
                          );
                          actions && (await Promise.all(actions));
                          downloadingFile.current.delete(id);
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
