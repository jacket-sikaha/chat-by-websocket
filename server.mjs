import { openSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { createServer } from "http";
import next from "next";
import { join } from "path";
import { Server } from "socket.io";
// "ws://192.168.4.241:3000"
const dev = process.env.NODE_ENV !== "production";
console.log("dev", process.env.NODE_ENV);
const hostname = "127.0.0.1";
const port = 3000;
const __dirname = process.cwd();
const projectFolder = join(__dirname, "tmp", "upload");
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);
  io.maxHttpBufferSize = 1e8; // 100M
  io.on("connection", (socket) => {
    // console.log("a user connected:" + socket.id);

    socket.on("chat message", (msg) => {
      // console.log("server-receive: " + msg);
      io.emit("chat message", msg);
      // 除某个发射套接字之外的所有人发送消息
      // socket.broadcast.emit("chat message", msg + new Date().toLocaleString());
    });

    socket.on("upload", async (file, callback) => {
      const { name, size, type, data } = file;
      try {
        openSync(projectFolder, "r");
      } catch (error) {
        if (error.code === "ENOENT") {
          const dirCreation = await mkdir(projectFolder, { recursive: true });
        } else {
          console.error("openSync error");
          return;
        }
      }
      try {
        let uuid = Date.now();
        await writeFile(join(projectFolder, `${uuid}-${name}`), data);
        //  cb函数只能发送的客户端能接收并执行，其他客户端没有响应
        io.emit("upload", {
          name: `${uuid}-${name}`,
          originName: name,
          size,
          type,
          uuid,
        });
      } catch (error) {
        callback({ message: error });
        console.error("writeFile error");
      }
    });

    socket.on("download-file", async (msg, cb) => {
      try {
        // const info = await statfs(join(projectFolder, msg));
        // console.log("info", info);
        const file = await readFile(join(projectFolder, msg));
        cb({ file, name: msg });
      } catch (error) {
        console.error("download error", error);
      }
    });
  });

  io.engine.on("connection_error", (err) => {
    const {
      req, // the request object
      code, // the error code, for example 1
      message, // the error message, for example "Session ID unknown"
      context, // some additional error context
    } = err;
    console.log(connection_error, {
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
