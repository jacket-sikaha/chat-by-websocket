import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { socket } from "@/service/socket";
import { Blockquote, Button } from "@radix-ui/themes";
import { SetStateAction, useEffect, useState } from "react";
import InputForm from "@/components/InputForm";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

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
      const item = document.createElement("div");
      item.textContent = msg;
      messages?.appendChild(item);
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
        {/* <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        {tags.map((tag) => (
          <>
            <div key={tag} className="text-sm">
              {tag}
            </div>
            <Separator className="my-2" />
          </>
        ))}
      </div> */}
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
