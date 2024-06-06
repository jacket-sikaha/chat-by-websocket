import { openSync } from "fs";
import { mkdir, opendir, writeFile } from "fs/promises";
import { createServer } from "http";
import next from "next";
import { join } from "path";
import { Server } from "socket.io";
// "ws://192.168.4.241:3000"
const dev = process.env.NODE_ENV !== "production";
const hostname = "192.168.4.241";
const port = 3000;
const __dirname = process.cwd();
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);
  io.maxHttpBufferSize = 8e8; // 800M
  io.on("connection", (socket) => {
    console.log("a user connected:" + socket.id);
    socket.on("chat message", (msg) => {
      console.log("server-receive: " + msg);
      io.emit("chat message", msg);
      // 除某个发射套接字之外的所有人发送消息
      // socket.broadcast.emit("chat message", msg + new Date().toLocaleString());
    });

    socket.on("upload", async (file, callback) => {
      console.log(file);
      const projectFolder = join(__dirname, "tmp", "upload");

      const { name, size, type, data } = file;
      try {
        openSync(projectFolder, "r");
      } catch (error) {
        if (error.code === "ENOENT") {
          console.error(projectFolder);
          const dirCreation = await mkdir(projectFolder, { recursive: true });
        } else {
          return;
        }
      }
      try {
        await writeFile(join(projectFolder, `${Date.now()}-${name}`), data);
        callback({ message: "success" });
      } catch (error) {
        callback({ message: error });
      }
    });
  });

  const nsp = io.of("/my-namespace");

  nsp.on("connection", (socket) => {
    console.log("someone connected");
  });

  io.engine.on("connection_error", (err) => {
    const {
      req, // the request object
      code, // the error code, for example 1
      message, // the error message, for example "Session ID unknown"
      context, // some additional error context
    } = err;
    console.log({
      req,
      code,
      message,
      context,
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
