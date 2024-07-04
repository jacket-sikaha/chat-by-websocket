# Nodejs实现简单的UDP打洞（内网穿透）实验


> 想实现UDP内网穿透,方法基本有两种，一种是通过服务器端口代理转发的方式，另外一种是通过UDP打洞来实现穿透。而所谓“**打洞**”其实原理也是非常简单，是通过**NAT映射老化时间**与UDP的**无连接协议**的特性实现的。
> 
> 简书：https://www.jianshu.com/p/63202b863568

### 1.打洞过程的简单说明

![](img/图片1.png)

说明：
- 首先假设有客户端A需要**定时**请求服务器，请求一开始会通过客户端的路由器或防火墙，也就是图片中的**1**，路由器在将数据发送给服务器也就是**2**
- 服务器记录下，客户端A的外网连接的地址与端口，然后将数据返回给客户端A，数据包括了客户端A的端口地址信息与其他客户端的信息，也就是**3**与**4**
- 这时再假设有个客户端B进行了与客户端A相同的步骤
- 由于客户端A和客户端B都保留了对方的外网ip和端口，所以**5**也就可以理解客户端之间不通过服务器直接进行访问，这也就是我们所说的**打洞**

### 2.编写服务端程序

这里编写的服务端就非常简单了，只是记录并将客户端数据发送给请求的客户端。


**代码**
```
var dgram = require('dgram');
var bencode = require('bencode');

//创建 udp server
var udp_server = dgram.createSocket('udp4');
// 绑定端口
udp_server.bind(8888);
// 绑定端口（自定义）
const clients = {};
// 监听端口
udp_server.on('listening', function () {
    console.log('UDP启动监听');
});

//接收消息
udp_server.on('message', function (msg, rinfo) {
    msg = bencode.decode(msg);
    clients[msg.id] = rinfo;
    // 将以记录的请求数据全部发送给请求的客户端
    let buf = bencode.encode({
        address: rinfo.address,
        port: rinfo.port,
        clients: clients,
        data: msg.data,
        id: msg.id,
        type: "server"
    });
    udp_server.send(buf, 0, buf.length, rinfo.port, rinfo.address); //将接收到的消息返回给客户端
    console.log(`客户端 ${rinfo.address}:${rinfo.port} 发送请求`);
});
//错误处理
udp_server.on('error', function (err) {
    console.log(err);
    udp_server.close();
});
```

### 3.编写客户端程序

客户端这边，定时发送数据给服务端，从服务端返回客户端列表中提取一个测试客户端，然后发送测试数据（代码中为了方便区分，所以用了比较冗余的写法）


**代码**
```
const dgram = require('dgram');
const bencode = require('bencode');

// 用时间戳模拟id标识
const ID = (+new Date()) + "";
//创建UDP服务
const udp_server = dgram.createSocket('udp4');
// 绑定随机端口
udp_server.bind();

// 监听端口
udp_server.on('listening', function (a) {
    console.log('UDP启动监听');
});
// 客户端信息，以及测试用的客户端信息
let clients, testClient;
//接收消息
udp_server.on('message', function (msg, rinfo) {
    var data = bencode.decode(msg);
    if (data.type == "server") {
        clients = data.clients;
        //获取测试的客户端
        for (let k in clients) {
            if (k !== ID) {
                testClient = clients[k];
                break;
            }
        }
    } else if (data.type == "client") {
        //显示获取的信息
        console.log((new Date()).toLocaleString(), data.id.toString(), rinfo.address.toString(), data.data.toString());
    }
})
//错误处理
udp_server.on('error', function (err) {
    console.log(err);
    udp_server.close();
});
// 向服务器发送消息
function sendServer() {
    var buff = bencode.encode({ id: ID, data: "Hello Server", type: "client" });
    // 自定义发送 服务器 外网端口与ip
    udp_server.send(buff, 0, buff.length, 8888, '你的服务端的外网地址');
}
sendServer();
// 向其他客户端发送测试数据
function sendClient() {
    if (testClient) {
        var buff = bencode.encode({ id: ID, data: "Hello Client", type: "client" });
        udp_server.send(buff, 0, buff.length, testClient.port, testClient.address.toString());
    }
}
// 定时发送服务器（发送心跳包）
setInterval(sendServer, 10000);
// 发送测试数据
setInterval(sendClient, 2000);
```

### 4.测试

按照原理，我将程序分别部署到三台不同外网地址的服务器上

一下是最终效果
![](img/sd2ad.gif)

