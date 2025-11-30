export interface JoinRoomEvent {
  roomId: string;
  userId: string;
  name?: string;
}

export interface LeaveRoomEvent {
  roomId: string;
  userId: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  code?: string;
  children?: FileNode[];
}

export interface FileTab {
  id: string;
  name: string;
  code: string;
  language: string;
  dirty: boolean;
}

export interface Participant {
  userId: string;
  name?: string;
  socketId: string;
}

export interface CodeChangeEvent {
  roomId: string;
  fileId: string;
  code: string;
  userId?: string;
  timestamp?: string;
}
