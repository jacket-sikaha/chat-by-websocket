const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
  //pingTimeout: 30000,
  transports: ["websocket", "polling"], // use WebSocket first, if available
});
const port = process.env.PORT || 3000;

const { instrument } = require("@socket.io/admin-ui");
const express = require("express");
instrument(io, {
  auth: false,
});

const fs = require("fs");
const path = require("path");
const UPLOAD_DIR = path.resolve(__dirname, "bigUpload");

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log(`${socket.id} user connected`);

  socket.use(([event, ...args], next) => {
    if (event === "bigFile") {
      let { file, fname, index, fext } = args[0];
      let chunkDir = `${UPLOAD_DIR}/${fname}`;

      if (!fs.existsSync(chunkDir)) {
        fs.mkdirSync(chunkDir);
      }

      let buffer = Buffer.from(file);

      fs.writeFileSync(path.join(chunkDir, String(index)), buffer);
    }

    if (event === "merge") {
      let { fname, fext } = args[0];
      let chunkDir = path.join(UPLOAD_DIR, fname);
      let time = Date.now();
      socket.fileTime = time;
      fs.readdir(chunkDir, (err, files) => {
        if (err) {
          throw err;
        }
        [...files].forEach((filename) => {
          fs.appendFileSync(
            path.join(__dirname, "upload", time + "." + fext),
            fs.readFileSync(`${chunkDir}/${filename}`)
          );
          console.log("56756" + 00);
        });
      });
    }

    next();
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("file message", (msg) => {
    // console.log(msg);
    let { name, size, type, file } = msg;
    // console.log(file);
    let buffer = Buffer.from(file);
    // console.log(buffer, buffer.toString());

    let locName = Date.now() + path.extname(name);
    //写入数据支持类型  只接受buffer  string
    fs.writeFile(
      path.join(__dirname, "/upload", locName),
      buffer,
      function (err) {
        if (err) return console.log(err);
        io.emit("file message", { locName, name, size, type });
      }
    );
  });

  socket.on("bigFile", (msg) => {
    // let { file, fname, index, fext } = msg;
    // let chunkDir = `${UPLOAD_DIR}/${fname}`;

    // if (!fs.existsSync(chunkDir)) {
    //   fs.mkdirSync(chunkDir);
    // }

    // let buffer = Buffer.from(file);

    // // console.log(path.join(chunkDir, String(index)));
    // //写入数据支持类型  只接受buffer  string
    // fs.writeFileSync(path.join(chunkDir, String(index)), buffer);
    console.log("@" + 00);
  });

  socket.on("merge", (msg) => {
    let { fname, fext } = msg;
    let chunkDir = path.join(UPLOAD_DIR, fname);

    // fs.readdir(chunkDir, (err, files) => {
    //   if (err) {
    //     throw err;
    //   }
    //   [...files].forEach((filename) => {
    //     fs.appendFileSync(
    //       path.join(__dirname, "upload", time + "." + fext),
    //       fs.readFileSync(`${chunkDir}/${filename}`)
    //     );
    //     console.log("56756" + 00);
    //   });
    // });

    fs.rm(
      chunkDir,
      {
        recursive: true,
        force: true,
      },
      (err) => {
        if (err) {
          throw err;
        }
        console.log(266666);
        let locName = socket.fileTime + "." + fext;
        let name = fname + "." + fext;
        io.emit("file message", { locName, name });
      }
    );
  });

  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} user disconnected because:${reason}`);
  });

  const transport = socket.conn.transport.name;
  console.log("*", transport);
  socket.conn.on("upgrade", () => {
    const upgradedTransport = socket.conn.transport.name; // 在大多数情况下，“websocket”
    console.log("***", upgradedTransport);
  });
});
io.engine.on("connection_error", (err) => {
  console.log(err.req); // the request object
  console.log(err.code); // the error code, for example 1
  console.log(err.message); // the error message, for example "Session ID unknown"
  console.log(err.context); // some additional error context
});

app.get("/down", (req, res) => {
  let { filename } = req.query;
  console.log(filename);
  //下载所需响应头
  res.setHeader("Content-type", "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment;filename=${filename}`);
  // res.setHeader("Content-type", "application/force-download");
  res.sendFile(__dirname + `/upload/${filename}`);
});

//HTTP请求合并文件
// app.post("/merge", (req, res) => {
//   let { fname, fext } = req.body;
//   let chunkDir = path.join(UPLOAD_DIR, fname);
//   let time = Date.now();

//   let files = fs.readdir(chunkDir, (err, files) => {
//     if (err) {
//       throw err;
//     }
//     [...files].forEach((filename, index) => {
//       fs.appendFileSync(
//         path.join(UPLOAD_DIR, time + "." + fext),
//         fs.readFileSync(`${chunkDir}/${filename}`)
//       );
//       console.log(index);
//     });
//   });

//   fs.rm(
//     chunkDir,
//     {
//       recursive: true,
//       force: true,
//     },
//     (err) => {
//       if (err) {
//         throw err;
//       }
//     }
//   );
//   console.log(266666);
//   res.send(fname);
// });

io.engine.on("connection_error", (err) => {
  console.log(err.req); // the request object
  console.log(err.code); // the error code, for example 1
  console.log(err.message); // the error message, for example "Session ID unknown"
  console.log(err.context); // some additional error context
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
