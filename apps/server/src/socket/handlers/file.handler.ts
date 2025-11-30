import { Server, Socket } from "socket.io";
import {
  createNode,
  deleteNode,
  moveNode,
  renameNode,
  updateCode,
} from "../../services/room.service";
import { FileNode, CodeChangeEvent } from "@repo/types";

export function registerFileHandlers(io: Server, socket: Socket) {
  socket.on(
    "file-create",
    async (payload: {
      roomId: string;
      fileId: string;
      name: string;
      type: "file" | "folder";
      parentId?: string | null;
    }) => {
      const { roomId, fileId, name, type, parentId } = payload;
      const newNode: FileNode = {
        id: fileId,
        name,
        type,
        code: type === "file" ? "" : undefined,
        children: type === "folder" ? [] : undefined,
      };
      const files = await createNode(roomId, newNode, parentId ?? null);
      io.to(roomId).emit("files-update", { roomId, files });
    }
  );

  socket.on(
    "file-move",
    async (payload: {
      roomId: string;
      fileId: string;
      targetFolderId?: string | null;
    }) => {
      const { roomId, fileId, targetFolderId } = payload;
      const files = await moveNode(roomId, fileId, targetFolderId ?? null);
      io.to(roomId).emit("files-update", { roomId, files });
    }
  );

  socket.on(
    "file-rename",
    async (payload: { roomId: string; fileId: string; name: string }) => {
      const { roomId, fileId, name } = payload;
      const files = await renameNode(roomId, fileId, name);
      io.to(roomId).emit("files-update", { roomId, files });
    }
  );

  socket.on(
    "file-delete",
    async (payload: { roomId: string; fileId: string }) => {
      const { roomId, fileId } = payload;
      const files = await deleteNode(roomId, fileId);
      io.to(roomId).emit("files-update", { roomId, files });
    }
  );

  socket.on("code-change", async (payload: CodeChangeEvent) => {
    const { roomId, fileId, code } = payload;
    const files = await updateCode(roomId, fileId, code);
    socket.to(roomId).emit("code-change", { roomId, fileId, code });
  });
}
