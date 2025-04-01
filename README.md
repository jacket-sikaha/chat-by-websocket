# 基于 websocket 设计一个文件传输助手网站

#### demo

http://xhx.huage.eu.org:8093/

接下来新目标，将重构一下前端页面。。。

---

## 初期目标------5/27

(htttp 协议版本)利用 nodejs（multer，express），Ajax 实现页面初步的上传下载

掌握

multer([官网中文 API](https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md))的使用：storage 设置存储位置，上传文件预处理利用时间戳对文件的重命名

回顾 express 创建静态资源服务器：static 的参数里写路径，目录名都行，都会对应到一个目录，在网页里这个目录名不需要带上，直接访问文件名即可；部署多个静态资源服务器，如果目录之间有同名文件，则按 static 执行顺序找，找到就停止，找不到就下一个

响应返回资源的设置：

```js
//默认情况(响应头不调整的情况)
//相当于跳转，但实际是返回资源给浏览器显示
res.sendFile(__dirname + "/index.html");
//区分
//下载所需响应头
res.setHeader("Content-type", "application/octet-stream");
//！！！响应头里不允许带中文
res.setHeader("Content-Disposition", `attachment;filename=asd.jpg`);
res.sendFile(__dirname + "/uploads/QQ图片20200621185630.jpg");
```

[下载响应头说明补充链接](https://cloud.tencent.com/developer/article/1417956#:~:text=http%20%E5%8D%8F%E8%AE%AE%E5%AE%9E%E7%8E%B0%E6%96%87%E4%BB%B6%E4%B8%8B%E8%BD%BD%E6%97%B6%EF%BC%8C%E9%9C%80%E8%A6%81%E5%9C%A8%20%E6%9C%8D%E5%8A%A1%E5%99%A8%20%E8%AE%BE%E7%BD%AE%E5%A5%BD%E7%9B%B8%E5%85%B3%E5%93%8D%E5%BA%94%E5%A4%B4%EF%BC%8C%E5%B9%B6%E4%BD%BF%E7%94%A8%E4%BA%8C%E8%BF%9B%E5%88%B6%E4%BC%A0%E8%BE%93%E6%96%87%E4%BB%B6%E6%95%B0%E6%8D%AE%EF%BC%8C%E8%80%8C%E5%AE%A2%E6%88%B7%E7%AB%AF%EF%BC%88%E6%B5%8F%E8%A7%88%E5%99%A8%EF%BC%89%E4%BC%9A%E6%A0%B9%E6%8D%AE%E5%93%8D%E5%BA%94%E5%A4%B4%E6%8E%A5%E6%94%B6%E6%96%87%E4%BB%B6%E6%95%B0%E6%8D%AE%E3%80%82%20%E5%9C%A8,http%20%E5%93%8D%E5%BA%94%E6%8A%A5%E6%96%87%E4%B8%AD%EF%BC%8C%20Content-type%20%E5%92%8C%20Content-Disposition%20%E6%98%AF%E6%9C%80%E5%85%B3%E9%94%AE%E7%9A%84%E4%B8%A4%E4%B8%AA%E5%93%8D%E5%BA%94%E5%A4%B4%E3%80%82)

## 中期目标------5/30

###### 仿照 HTTP 的文件上传下载改成**websocket 协议的版本**

###### 补充资料

[socket.io 官网的案例 https://socket.io/get-started/chat](https://socket.io/get-started/chat)

[socket.io emit 方法支持文件传输的数据类型](https://socket.io/blog/introducing-socket-io-1-0/#binary-support)

[前端上传文件的方法总结与利弊](https://www.cnblogs.com/soraly/p/8441589.html)

- 准备工作，确定能编写 websocket 的工具------socket.io

- 仿照[官网的案例](https://socket.io/get-started/chat)，我们就可以很快的搭建一个 websocket 环境

- 我们实现文件传输就得确认如何从前端拿取数据，用什么数据类型进行存储，传输，这是整个项目的核心。基于 api 提供的 emit 方法和[补充内容](https://socket.io/blog/introducing-socket-io-1-0/#binary-support)，socket 是可以接收很多种类的参数，自然也包括文件，但限定一下几种类型 Blob，ArrayBuffer，File

  ![image-20220530231529952](C:\Users\98755\AppData\Roaming\Typora\typora-user-images\image-20220530231529952.png)

- 再了解[前端通过 input[type=file]的标签拿取文件数据的方式](https://www.cnblogs.com/soraly/p/8441589.html)后，采用**[fileReader](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader/FileReader)**的方式，因为其余两种方式对 HTTP 的依赖性较强，websocket 难以处理

- 数据到 node 服务端就到了**上传步骤**，就需要有能处理这种 ArrayBuffer 类型的工具：fs，path（fs 负责将数据写入进文件，path 处理文件的路径问题）

- 最大问题，fs.writeFile 方法对写入数据类型会有限制：ArrayBuffer 不完全等于 Buffer

  ![image-20220531001815887](C:\Users\98755\AppData\Roaming\Typora\typora-user-images\image-20220531001815887.png)

  解决办法就是类型转换https://blog.csdn.net/iningwei/article/details/100143603 let buffer = Buffer.from(arraybuffer)//ArrayBuffer 转 Buffer

- 写入成功执行其回调函数时，我们就可以提供对应的下载链接给前端，借助服务端的下载接口完成下载（借助 http 协议去实现下载，因为下载是属于用户自身需求，不需要共享）

- 后续问题，对 1M 以上的文件无法上传

## 解决问题的关键，文件分片上传与合并------6/2（生产模式下无法解决）

大的文件读取 readAsArrayBuffer 对本机的内存消耗过大，导致 websocket 重连

https://www.bilibili.com/video/BV1RK4y147uV?share_source=copy_web

## 直接突破：修改 websocket 的心跳机制和传输数据大小限制------6/5

部署之后分片上传失败，初步怀疑是 websocket 的原因---完成一次请求就会重启

于是直接修改配置：

- maxHttpBufferSize: 50000000,//50M
  pingTimeout: 30000,//单次 socket 消息发送的最大连接时长，超过就重连

  https://socket.io/docs/v4/server-options/#transports
