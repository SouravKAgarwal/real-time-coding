"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Participant {
  userId: string;
  name?: string;
  socketId: string;
}

interface ParticipantsListProps {
  roomId: string;
}

export function ParticipantsList({ roomId }: ParticipantsListProps) {
  const { socket } = useSocket();
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("get-participants", { roomId });

    const handleParticipantsUpdate = (data: {
      roomId: string;
      users: Participant[];
    }) => {
      if (data.roomId === roomId) {
        setParticipants(data.users);
      }
    };

    const handleUserJoined = (data: {
      roomId: string;
      userId: string;
      name: string;
    }) => {
      if (data.roomId === roomId) {
        // The participants list will be updated by participants-update event usually,
        // but we can also optimistically add if needed.
        // For now, let's rely on participants-update which is emitted on join.
      }
    };

    socket.on("participants-update", handleParticipantsUpdate);
    socket.on("user-joined", handleUserJoined);

    return () => {
      socket.off("participants-update", handleParticipantsUpdate);
      socket.off("user-joined", handleUserJoined);
    };
  }, [socket, roomId]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Participants ({participants.length})
        </h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {participants.map((participant) => (
            <div
              key={participant.userId}
              className="flex items-center gap-3 group"
            >
              <Avatar className="h-8 w-8 border border-gray-700">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.userId}`}
                />
                <AvatarFallback>
                  {participant.name?.slice(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                  {participant.name || "Anonymous"}
                </span>
                <span className="text-xs text-gray-500">
                  {participant.userId.slice(0, 8)}...
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
