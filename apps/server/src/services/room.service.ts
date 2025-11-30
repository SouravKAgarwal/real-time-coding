import { Room } from "../models/room.model";
import { FileNode, Participant } from "@repo/types";

const rooms = new Map<string, Room>();

function findNodeAndParent(
  nodes: FileNode[],
  fileId: string,
  parent: FileNode[] | null = null
): { node?: FileNode; parent?: FileNode[] } {
  for (const n of nodes) {
    if (n.id === fileId) return { node: n, parent: parent ?? nodes };
    if (n.children) {
      const found = findNodeAndParent(n.children, fileId, n.children);
      if (found.node) return found;
    }
  }
  return {};
}

export async function getOrCreateRoom(roomId: string): Promise<Room> {
  let room = rooms.get(roomId);
  if (!room) {
    room = { roomId, files: [], participants: [] };
    rooms.set(roomId, room);
  }
  return room;
}

export async function getFiles(roomId: string): Promise<FileNode[]> {
  const room = await getOrCreateRoom(roomId);
  return room.files;
}

export async function getParticipants(roomId: string): Promise<Participant[]> {
  const room = await getOrCreateRoom(roomId);
  return room.participants;
}

export async function addParticipant(roomId: string, p: Participant) {
  const room = await getOrCreateRoom(roomId);
  const existingParticipant = room.participants.find(
    (x) => x.userId === p.userId
  );

  // Even with in-memory, we can try to keep the "status" logic if we want,
  // but since the user asked to remove MongoDB integration and the previous "status" logic
  // was part of the "professional schema" push, I will revert to simple array management
  // to be safe and simple, unless I see Participant type has status.
  // Checking types/index.ts... it seems Participant is just userId, name, socketId.
  // So I will just push/update.

  const idx = room.participants.findIndex((x) => x.userId === p.userId);
  if (idx === -1) {
    room.participants.push(p);
  } else {
    room.participants[idx] = p;
  }
  return room.participants;
}

export async function removeParticipant(
  roomId: string,
  userId?: string,
  socketId?: string
) {
  const room = await getOrCreateRoom(roomId);
  room.participants = room.participants.filter((p) =>
    userId ? p.userId !== userId : socketId ? p.socketId !== socketId : true
  );
  return room.participants;
}

export async function createNode(
  roomId: string,
  node: FileNode,
  parentId?: string | null
): Promise<FileNode[]> {
  const room = await getOrCreateRoom(roomId);

  if (!parentId) {
    room.files.push(node);
  } else {
    const found = findNodeAndParent(room.files, parentId);
    if (found.node && found.node.type === "folder") {
      found.node.children = found.node.children || [];
      found.node.children.push(node);
    } else {
      room.files.push(node);
    }
  }

  return room.files;
}

export async function deleteNode(
  roomId: string,
  fileId: string
): Promise<FileNode[]> {
  const room = await getOrCreateRoom(roomId);

  function remove(nodes: FileNode[]): FileNode[] {
    return nodes.filter((n) => {
      if (n.id === fileId) return false;
      if (n.children) n.children = remove(n.children);
      return true;
    });
  }
  room.files = remove(room.files);

  return room.files;
}

export async function moveNode(
  roomId: string,
  fileId: string,
  targetFolderId?: string | null
) {
  const room = await getOrCreateRoom(roomId);
  let nodeToMove: FileNode | undefined;

  function remove(nodes: FileNode[]): FileNode[] {
    return nodes.filter((n) => {
      if (n.id === fileId) {
        nodeToMove = n;
        return false;
      }
      if (n.children) n.children = remove(n.children);
      return true;
    });
  }
  room.files = remove(room.files);

  if (nodeToMove) {
    if (!targetFolderId) {
      room.files.push(nodeToMove);
    } else {
      const found = findNodeAndParent(room.files, targetFolderId);
      if (found.node && found.node.type === "folder") {
        found.node.children = found.node.children || [];
        found.node.children.push(nodeToMove);
      } else {
        room.files.push(nodeToMove);
      }
    }
  }

  return room.files;
}

export async function renameNode(roomId: string, fileId: string, name: string) {
  const room = await getOrCreateRoom(roomId);
  const found = findNodeAndParent(room.files, fileId);
  if (found.node) {
    found.node.name = name;
  }
  return room.files;
}

export async function updateCode(roomId: string, fileId: string, code: string) {
  const room = await getOrCreateRoom(roomId);
  const found = findNodeAndParent(room.files, fileId);
  if (found.node && found.node.type === "file") {
    found.node.code = code;
  }
  return room.files;
}
