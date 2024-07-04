import { createSocket } from "dgram";

//创建 udp server
var udp_server = createSocket("udp4");
// 绑定端口（自定义）
udp_server.bind(8888);
// 记录连接者
const clients = new Set();
let publicEndpointA, publicEndpointB;
const KEY = "SIKARA";

// 监听端口
udp_server.on("listening", function () {
  console.log(
    "UDP Server listening on " +
      udp_server.address().address +
      ":" +
      udp_server.address().port
  );
});

//接收消息
udp_server.on("message", function (message, remote) {
  const data = JSON.parse(message);
  const { token, type, id } = data;
  const address = remote.address + ":" + remote.port;
  console.log(address);
  if (token === KEY && type === "client") {
    if (clients.has(id) || clients.size == 2) {
      return;
    }
    clients.add(id);
    if (publicEndpointA) {
      publicEndpointB = {
        address: remote.address,
        port: remote.port,
        data: data.data,
        id,
        type: "server",
        token,
      };
    } else {
      publicEndpointA = {
        address: remote.address,
        port: remote.port,
        data: data.data,
        id,
        type: "server",
        token,
      };
    }

    console.log("data", publicEndpointA, publicEndpointB);
  }

  sendPublicDataToClients();
});

function sendPublicDataToClients() {
  if (publicEndpointA && publicEndpointB) {
    const messageForA = Buffer.from(JSON.stringify(publicEndpointB));
    udp_server.send(
      messageForA,
      0,
      messageForA.length,
      publicEndpointA.port,
      publicEndpointA.address,
      function (err, nrOfBytesSent) {
        if (err) return console.log(err);
        console.log("> public endpoint of B sent to A");
      }
    );

    const messageForB = Buffer.from(JSON.stringify(publicEndpointA));
    udp_server.send(
      messageForB,
      0,
      messageForB.length,
      publicEndpointB.port,
      publicEndpointB.address,
      function (err, nrOfBytesSent) {
        if (err) return console.log(err);
        console.log("> public endpoint of A sent to B");
      }
    );
  }
}

//错误处理
udp_server.on("error", function (err) {
  console.log(err);
  udp_server.close();
});

udp_server.on("close", function () {
  console.log(
    "UDP Server listening on " +
      udp_server.address().address +
      ":" +
      udp_server.address().port
  );
});
