import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
// "ws://192.168.4.241:3000"
const dev = process.env.NODE_ENV !== "production";
const hostname = "192.168.4.241";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log(socket.id); // ojIckSD2jqNzOqIrAGzL
    console.log("a user connected");
    socket.on("chat message", (msg) => {
      console.log("server-receive: " + msg);
      io.emit("chat message", msg);
      // 除某个发射套接字之外的所有人发送消息
      // socket.broadcast.emit("chat message", msg + new Date().toLocaleString());
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
