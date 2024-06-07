import { socket } from "@/service/socket";
import { FileSocketData } from "@/type/socket-io";
import { useEffect, useState } from "react";
import { showToast } from ".";

export const useFileHook = () => {
  const [fileList, setFileList] = useState<FileSocketData[]>([]);

  const handleFileSummit = async (files: FileList) => {
    const { name, size, type } = files[0];
    let data = await files[0].arrayBuffer();
    socket.emit(
      "upload",
      { name, size, type, data },
      (status: any, file: FileSocketData) => {
        if (status.message === "success") {
          const messages = document.getElementById("messages");
          setFileList([...fileList, file]);
          const item = document.createElement("div");
          item.onclick = () => {
            file?.name && socket.emit("download-file", file.name);
          };
          item.textContent = JSON.stringify(file);
          messages?.appendChild(item);
        }
        showToast(status);
      }
    );
  };

  useEffect(() => {
    socket.on("download-file", (data: ArrayBuffer, name: string) => {
      //   console.log("client-receive: " + msg);
      // 创建一个新的 Blob 对象
      const blob = new Blob([data], { type: "application/octet-stream" });
      // 创建一个 URL 对象
      const url = URL.createObjectURL(blob);
      // 创建一个链接元素
      const link = document.createElement("a");
      link.href = url;
      // 设置下载的文件名
      link.download = name;
      // 将链接元素添加到页面中
      document.body.appendChild(link);
      // 触发点击事件，开始下载
      link.click();
      // 从页面中移除链接元素
      document.body.removeChild(link);
    });
  }, []);

  return { fileList, handleFileSummit };
};