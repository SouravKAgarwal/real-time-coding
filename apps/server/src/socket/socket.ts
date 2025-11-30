import { Server, Socket } from "socket.io";
import { registerRoomHandlers } from "./handlers/room.handler";
import { registerFileHandlers } from "./handlers/file.handler";

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    registerRoomHandlers(io, socket);
    registerFileHandlers(io, socket);
  });
}
