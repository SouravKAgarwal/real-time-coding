import { Server, Socket } from "socket.io";
import {
  addParticipant,
  getFiles,
  getParticipants,
  removeParticipant,
} from "../../services/room.service";
import { JoinRoomEvent, LeaveRoomEvent } from "@repo/types";

export function registerRoomHandlers(io: Server, socket: Socket) {
  socket.on("join-room", async (payload: JoinRoomEvent) => {
    const { roomId, userId, name } = payload;
    socket.join(roomId);

    await addParticipant(roomId, { userId, name, socketId: socket.id });

    io.to(roomId).emit("user-joined", { roomId, userId, name });

    const files = await getFiles(roomId);
    socket.emit("files-update", { roomId, files });

    const participants = await getParticipants(roomId);
    io.to(roomId).emit("participants-update", {
      roomId,
      users: participants,
    });
  });

  socket.on("leave-room", async (payload: LeaveRoomEvent) => {
    const { roomId, userId } = payload;
    const participants = await (async () => {
      await removeParticipant(roomId, userId, undefined);
      return getParticipants(roomId);
    })();
    io.to(roomId).emit("participants-update", {
      roomId,
      users: await participants,
    });
    const user = (await participants).find((p) => p.userId === userId);
    if (user && user.name) {
      io.to(roomId).emit("user-left", { roomId, userId, name: user.name });
    } else {
      io.to(roomId).emit("user-left", { roomId, userId, name: undefined });
    }
  });

  socket.on("get-participants", async (payload: { roomId: string }) => {
    const { roomId } = payload;
    const participants = await getParticipants(roomId);
    socket.emit("participants-update", { roomId, users: participants });
  });

  socket.on("disconnecting", async () => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    for (const roomId of rooms) {
      await removeParticipant(roomId, undefined, socket.id);
      const participants = await getParticipants(roomId);
      io.to(roomId).emit("participants-update", {
        roomId,
        users: participants,
      });
      io.to(roomId).emit("user-left", {
        roomId,
        userId: socket.id,
        name: undefined,
      });
    }
  });
}
