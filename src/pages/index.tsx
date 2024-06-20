import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { socket } from "@/service/socket";
import { Blockquote, Button } from "@radix-ui/themes";
import { SetStateAction, useEffect, useState } from "react";
import InputForm from "@/components/InputForm";
import { useMsgStore } from "@/context/store";
import { MsgType } from "@/type/ws-message";
import { File } from "lucide-react";
import { FileSocketData } from "@/type/socket-io";
import { downloadFileCb } from "@/components/InputForm/file-hook";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const { msgList, AddMsgList } = useMsgStore();

  useEffect(() => {
    const messages = document.getElementById("messages");

    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      socket.io.engine.on(
        "upgrade",
        (transport: { name: SetStateAction<string> }) => {
          setTransport(transport.name);
        }
      );
    }
    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("chat message", (msg: string | null) => {
      msg && AddMsgList({ type: MsgType.TEXT, data: msg });
      window.scrollTo(0, document.body.scrollHeight);
    });

    return () => {
      socket.off("chat message");
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div className="flex flex-col items-center p-3 h-screen">
      <Blockquote>
        <p>Status: {isConnected ? "connected" : "disconnected"}</p>
        <p>Transport: {transport}</p>
      </Blockquote>
      {/* <p>clientsCount: {socket.engine.clientsCount}</p> */}

      <div
        id="messages"
        className="flex-1 w-full rounded-md border p-2 my-3 overflow-y-auto"
      >
        {msgList.map((msg, index) => {
          return (
            <div
              key={index}
              className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
            >
              {msg.type === MsgType.TEXT ? (
                <>
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {msg.data as string}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleString()}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <File className="flex h-6 w-6 translate-y-1" />
                  <div
                    className="space-y-1"
                    onClick={() => {
                      socket.emit(
                        "download-file",
                        msg.data as FileSocketData,
                        downloadFileCb
                      );
                    }}
                  >
                    <p className="text-sm font-medium leading-none">
                      {(msg.data as FileSocketData).originName}
                    </p>
                    <p className="text-sm text-muted-foreground flex justify-between">
                      <span>{new Date().toLocaleString()}</span>
                      <span>
                        {Math.fround((msg.data as FileSocketData).size / 1024)}
                        kb
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <Tabs defaultValue="text" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="file">File</TabsTrigger>
        </TabsList>
        <TabsContent value="text">
          <InputForm />
        </TabsContent>
        <TabsContent value="file">
          <InputForm isFile />
        </TabsContent>
      </Tabs>
    </div>
  );
}
