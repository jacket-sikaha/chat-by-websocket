import { socket } from "@/service/socket";
import { SetStateAction, useEffect, useState } from "react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    const form = document.getElementById("form");
    const input = document.getElementById("input");
    const messages = document.getElementById("messages");

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (input?.value) {
        socket.emit("chat message", input.value);
        // const item = document.createElement("li");
        // item.textContent = input.value;
        // messages?.appendChild(item);
        // window.scrollTo(0, document.body.scrollHeight);
        input.value = "";
      }
    });

    if (socket.connected) {
      onConnect();
    }
    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }
    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("chat message", (msg: string | null) => {
      console.log("client-receive: " + msg);
      const item = document.createElement("li");
      item.textContent = msg;
      messages?.appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>
      <ul id="messages"></ul>
      <form id="form" action="">
        <input id="input" className="bg-green-300" autoComplete="off" />
        <button>Send</button>
      </form>
    </div>
  );
}
