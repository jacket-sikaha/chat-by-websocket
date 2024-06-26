import { useMsgStore } from "@/context/store";
import { socket } from "@/service/socket";
import { FileSocketData } from "@/type/socket-io";
import { MsgType } from "@/type/ws-message";
import { useEffect } from "react";

export const downloadFileCb = ({
  file,
  name,
}: {
  file: ArrayBuffer;
  name: string;
}) => {
  console.log("client-receive: " + file);
  // 创建一个新的 Blob 对象
  const blob = new Blob([file], {
    type: "application/octet-stream",
  });
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
};

export const useFileHook = () => {
  const { msgList, AddMsgList } = useMsgStore();

  const handleFileSummit = async (files: FileList) => {
    const { name, size, type } = files[0];
    let data = await files[0].arrayBuffer();
    socket.emit("upload", { name, size, type, data });
  };

  useEffect(() => {
    socket.on("upload", (file: FileSocketData) => {
      AddMsgList({ type: MsgType.FILE, data: { ...file } });
    });
    return () => {
      socket.off("upload");
    };
  }, []);

  return { handleFileSummit };
};
