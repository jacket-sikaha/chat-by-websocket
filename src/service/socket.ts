import { ServerToClientEvents, ClientToServerEvents } from "@/type/socket-io";
import { io, Socket } from "socket.io-client";

const isBrowser = typeof window !== "undefined";
// 如果您的前端不是来自与服务器相同的域，则必须传递服务器的 URL
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  isBrowser ? io() : {};

export const orderSocket = io("/orders"); // the "orders" namespace
export const userSocket = io("/users"); // the "users" namespace
