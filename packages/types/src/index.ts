export interface CodeChangeEvent {
  code: string;
  fileId: string;
  roomId: string;
}

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
