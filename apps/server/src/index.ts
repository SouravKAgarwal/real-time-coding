import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import {
  type CodeChangeEvent,
  type JoinRoomEvent,
  type LeaveRoomEvent,
  type FileNode,
} from "@repo/types";

const app = express();
app.use(cors({ origin: "*" }));
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Server is working");
});

const io = new Server(server, { cors: { origin: "*" } });

const rooms: Record<
  string,
  {
    files: FileNode[];
    participants: { userId: string; name?: string; socketId: string }[];
  }
> = {};

function findAndUpdate(
  nodes: FileNode[],
  fileId: string,
  cb: (node: FileNode, parent: FileNode[] | null) => boolean
): boolean {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (!node) continue;

    if (node.id === fileId) {
      return cb(node, nodes);
    }

    if (node.children && findAndUpdate(node.children, fileId, cb)) {
      return true;
    }
  }
  return false;
}

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, userId, name }: JoinRoomEvent) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { files: [], participants: [] };
    }

    if (!rooms[roomId].participants.find((p) => p.userId === userId)) {
      rooms[roomId].participants.push({
        userId,
        name,
        socketId: socket.id,
      });
    }

    io.to(roomId).emit("user-joined", { roomId, userId, name });

    socket.emit("files-update", {
      roomId,
      files: rooms[roomId].files,
    });

    io.to(roomId).emit("participants-update", {
      roomId,
      users: rooms[roomId].participants,
    });
  });

  socket.on("file-create", ({ roomId, fileId, name, type, parentId }) => {
    if (!rooms[roomId]) return;

    const newNode: FileNode = {
      id: fileId,
      name,
      type,
      code: type === "file" ? "" : undefined,
      children: type === "folder" ? [] : undefined,
    };

    if (parentId) {
      findAndUpdate(rooms[roomId].files, parentId, (node) => {
        if (node.type === "folder") {
          node.children = node.children || [];
          node.children.push(newNode);
          return true;
        }
        return false;
      });
    } else {
      rooms[roomId].files.push(newNode);
    }

    io.to(roomId).emit("files-update", {
      roomId,
      files: rooms[roomId].files,
    });
  });

  socket.on("file-move", ({ roomId, fileId, targetFolderId }) => {
    const room = rooms[roomId];
    if (!room) return;

    let nodeToMove: FileNode | null = null;

    findAndUpdate(room.files, fileId, (node, parent) => {
      if (parent) {
        const idx = parent.findIndex((c) => c.id === fileId);
        if (idx >= 0) {
          const removed = parent.splice(idx, 1)[0];
          if (removed) nodeToMove = removed;
          return true;
        }
      } else {
        const idx = room.files.findIndex((c) => c.id === fileId);
        if (idx >= 0) {
          const removed = room.files.splice(idx, 1)[0];
          if (removed) nodeToMove = removed;
          return true;
        }
      }
      return false;
    });

    if (!nodeToMove) return;

    if (!targetFolderId) {
      room.files.push(nodeToMove);
    } else {
      findAndUpdate(room.files, targetFolderId, (targetNode) => {
        if (targetNode.type === "folder") {
          targetNode.children = targetNode.children || [];
          targetNode.children.push(nodeToMove as FileNode);
          return true;
        }
        return false;
      });
    }

    io.to(roomId).emit("files-update", { roomId, files: room.files });
  });

  socket.on("file-rename", ({ roomId, fileId, name }) => {
    if (!rooms[roomId]) return;

    findAndUpdate(rooms[roomId].files, fileId, (node) => {
      node.name = name;
      return true;
    });

    io.to(roomId).emit("files-update", {
      roomId,
      files: rooms[roomId].files,
    });
  });

  socket.on("file-delete", ({ roomId, fileId }) => {
    if (!rooms[roomId]) return;

    findAndUpdate(rooms[roomId].files, fileId, (_, parent) => {
      if (parent) {
        const idx = parent.findIndex((c) => c.id === fileId);
        if (idx >= 0) parent.splice(idx, 1);
      }
      return true;
    });

    io.to(roomId).emit("files-update", {
      roomId,
      files: rooms[roomId].files,
    });
  });

  socket.on("code-change", ({ roomId, fileId, code }: CodeChangeEvent) => {
    if (!rooms[roomId]) return;

    findAndUpdate(rooms[roomId].files, fileId, (node) => {
      if (node.type === "file") {
        node.code = code;
        return true;
      }
      return false;
    });

    socket.to(roomId).emit("code-change", { roomId, fileId, code });
  });

  socket.on("get-participants", ({ roomId }: { roomId: string }) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("participants-update", { roomId, users: [] });
      return;
    }
    socket.emit("participants-update", {
      roomId,
      users: room.participants.map((p) => ({
        userId: p.userId,
        name: p.name,
        socketId: p.socketId,
      })),
    });
  });

  socket.on("leave-room", ({ roomId, userId }: LeaveRoomEvent) => {
    const room = rooms[roomId];
    if (!room) return;

    const user = room.participants.find((p) => p.userId === userId);
    const name = user?.name;

    room.participants = room.participants.filter((p) => p.userId !== userId);

    socket.leave(roomId);

    io.to(roomId).emit("participants-update", {
      roomId,
      users: room.participants,
    });

    if (name) {
      io.to(roomId).emit("user-left", { roomId, userId, name });
    }

    if (room.participants.length === 0) delete rooms[roomId];
  });

  socket.on("disconnecting", () => {
    const roomsJoined = Array.from(socket.rooms).filter((r) => r !== socket.id);
    roomsJoined.forEach((roomId) => {
      const room = rooms[roomId];
      if (!room) return;

      const user = room.participants.find((p) => p.socketId === socket.id);
      if (user) {
        room.participants = room.participants.filter(
          (p) => p.socketId !== socket.id
        );

        io.to(roomId).emit("participants-update", {
          roomId,
          users: room.participants,
        });

        io.to(roomId).emit("user-left", {
          roomId,
          userId: user.userId,
          name: user.name,
        });

        if (room.participants.length === 0) delete rooms[roomId];
      }
    });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
