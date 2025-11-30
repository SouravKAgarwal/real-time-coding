"use client";

import { Copy, LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useEffect, useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Participant {
  userId: string;
  name?: string;
  socketId: string;
}

export const Header = ({ roomId }: { roomId: string }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { socket } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!roomId || !socket) return;

    const handleParticipantsUpdate = (data: {
      roomId: string;
      users: Participant[];
    }) => {
      if (data.roomId === roomId) {
        setParticipants(data.users);
      }
    };

    socket.emit("get-participants", { roomId });
    socket.on("participants-update", handleParticipantsUpdate);

    return () => {
      socket.off("participants-update", handleParticipantsUpdate);
    };
  }, [roomId, socket]);

  const currentUser = participants.find((p) => p.socketId === socket?.id);
  const currentUserId = currentUser?.userId;

  const others = participants.filter((p) => p.userId !== currentUserId);
  const sortedParticipants = [...others];
  if (currentUser) {
    sortedParticipants.splice(2, 0, currentUser);
  }

  const maxVisible = 3;
  const visibleParticipants = sortedParticipants.slice(0, maxVisible);
  const remainingCount = sortedParticipants.length - maxVisible;

  const handleRoomLeave = () => {
    if (!currentUserId || !socket) return;
    socket.emit("leave-room", { roomId, userId: currentUserId });
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#434346] text-gray-200">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-bold text-white">CodeCollab</h1>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-xs hover:bg-[#252526] hover:text-white rounded-md flex items-center"
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  toast.success("Room ID copied");
                }}
              >
                <Copy size={14} className="mr-1" />
                {roomId}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Room ID</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex -space-x-2">
          <TooltipProvider>
            {visibleParticipants.map((user) => (
              <Tooltip key={user.userId}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className="h-7 w-7 border-2 border-[#1e1e1e]">
                      <AvatarFallback
                        className={cn(
                          "text-xs font-medium",
                          user.userId === currentUserId
                            ? "bg-green-600 text-white"
                            : "bg-blue-500 text-white"
                        )}
                      >
                        {user?.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 block h-2 w-2 rounded-full border-2 border-[#1e1e1e]",
                        user.socketId ? "bg-green-500" : "bg-gray-500"
                      )}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>{user.name || "Unknown"}</TooltipContent>
              </Tooltip>
            ))}

            {remainingCount > 0 && (
              <div className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-700 text-xs border-2 border-[#1e1e1e]">
                +{remainingCount}
              </div>
            )}
          </TooltipProvider>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full"
              onClick={handleRoomLeave}
            >
              <LogOutIcon size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Leave Room</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
};
