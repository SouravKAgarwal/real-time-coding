import { FileNode, Participant } from "@repo/types";

export interface Room {
  roomId: string;
  files: FileNode[];
  participants: Participant[];
}
