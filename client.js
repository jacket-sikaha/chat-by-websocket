import { createSocket } from "dgram";

// 用时间戳模拟id标识
const ID = Date.now();
//创建UDP服务
const udp_server = createSocket("udp4");
// 绑定随机端口
udp_server.bind();
const serverAddress = "localhost";
const serverPort = 8888;
const KEY = "SIKARA";

// 监听端口
udp_server.on("listening", function (a) {
  console.log("UDP启动监听");
});
// 客户端信息，以及测试用的客户端信息
let clients, testClient;
//接收消息
udp_server.on("message", function (msg, remote) {
  console.log(remote.address + ":" + remote.port);
  try {
    const tmp = JSON.parse(msg);
    if (tmp.token === KEY && tmp.type === "server") {
      testClient = tmp;
      console.log("获取ip成功");
      // sendClient(testClient.address, testClient.port);
    } else {
      console.log(tmp.data);
    }
  } catch (err) {}
});

// 向服务器发送消息
function sendServer() {
  const buff = Buffer.from(
    JSON.stringify({ id: ID, data: "Hello Server", type: "client", token: KEY })
  );
  // 自定义发送 服务器 外网端口与ip
  udp_server.send(buff, 0, buff.length, serverPort, serverAddress);
}
sendServer();

// 向其他客户端发送测试数据
function sendClient() {
  if (testClient) {
    const buff = Buffer.from(
      JSON.stringify({ id: ID, data: "我是" + ID, type: "client" })
    );
    udp_server.send(buff, 0, buff.length, testClient.port, testClient.address);
  }
}
// // 定时发送服务器（发送心跳包）
// setInterval(sendServer, 10000);

// 发送测试数据
setInterval(sendClient, 2000);

//错误处理
udp_server.on("error", function (err) {
  console.log(err);
  udp_server.close();
});
