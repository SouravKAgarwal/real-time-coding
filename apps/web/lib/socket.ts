import { io, type Socket } from "socket.io-client";
import type {
  CodeChangeEvent,
  FileNode,
  JoinRoomEvent,
  LeaveRoomEvent,
} from "@repo/types";

const URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(URL, {
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socket.connect();
  }
  return socket;
};

// ------------------ Room Management ------------------

export const joinRoom = (payload: JoinRoomEvent) => {
  getSocket().emit("join-room", payload);
};

export const leaveRoom = ({ roomId, userId }: LeaveRoomEvent) => {
  getSocket().emit("leave-room", { roomId, userId });
};

// ------------------ File Management ------------------

export const createFile = (
  roomId: string,
  fileId: string,
  name: string,
  type: "file" | "folder" = "file",
  parentId: string | null = null
) => {
  getSocket().emit("file-create", { roomId, fileId, name, type, parentId });
};

export const renameFile = (roomId: string, fileId: string, name: string) => {
  getSocket().emit("file-rename", { roomId, fileId, name });
};

export const moveFile = (
  roomId: string,
  fileId: string,
  targetFolderId: string
) => {
  getSocket().emit("file-move", { roomId, fileId, targetFolderId });
};

export const deleteFile = (roomId: string, fileId: string) => {
  getSocket().emit("file-delete", { roomId, fileId });
};

// ------------------ Code Updates ------------------

export const emitCodeChange = (payload: CodeChangeEvent) => {
  getSocket().emit("code-change", payload);
};

export const onFilesUpdate = (
  roomId: string,
  callback: (files: FileNode[]) => void
): (() => void) => {
  const handler = (data: { roomId: string; files: FileNode[] }) => {
    if (data.roomId === roomId) callback(data.files);
  };
  getSocket().on("files-update", handler);
  return () => getSocket().off("files-update", handler);
};

export const onCodeChange = (
  roomId: string,
  callback: (data: { fileId: string; code: string }) => void
): (() => void) => {
  const handler = (data: { roomId: string; fileId: string; code: string }) => {
    if (data.roomId === roomId)
      callback({ fileId: data.fileId, code: data.code });
  };
  getSocket().on("code-change", handler);
  return () => getSocket().off("code-change", handler);
};

// ------------------ Participants ------------------

export const getParticipants = (
  roomId: string,
  callback: (
    participants: { userId: string; name?: string; socketId: string }[]
  ) => void
) => {
  const socket = getSocket();

  const handler = (data: {
    roomId: string;
    users: { userId: string; name?: string; socketId: string }[];
  }) => {
    if (data.roomId === roomId) {
      const participants = data.users.map(({ userId, name, socketId }) => ({
        userId,
        name,
        socketId,
      }));
      callback(participants);
    }
  };

  socket.on("participants-update", handler);

  return () => {
    socket.off("participants-update", handler);
  };
};

// ------------------ User Notifications ------------------

export const onUserJoined = (
  roomId: string,
  callback: (user: { userId: string; name?: string }) => void
): (() => void) => {
  const handler = (data: { roomId: string; userId: string; name?: string }) => {
    if (data.roomId === roomId) {
      callback({
        userId: data.userId,
        name: data.name,
      });
    }
  };
  getSocket().on("user-joined", handler);
  return () => getSocket().off("user-joined", handler);
};

export const onUserLeft = (
  roomId: string,
  callback: (user: { userId: string; name?: string }) => void
): (() => void) => {
  const handler = (data: { roomId: string; userId: string; name?: string }) => {
    if (data.roomId === roomId) {
      callback({
        userId: data.userId,
        name: data.name,
      });
    }
  };
  getSocket().on("user-left", handler);
  return () => getSocket().off("user-left", handler);
};
