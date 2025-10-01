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
import { getParticipants, getSocket, leaveRoom } from "@/lib/socket";
import Link from "next/link";
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
  const socket = getSocket();
  const router = useRouter();

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = getParticipants(roomId, (users) => {
      setParticipants(users);
    });

    socket.emit("get-participants", { roomId });

    return () => unsubscribe();
  }, [roomId, socket]);

  const currentUser = participants.find((p) => p.socketId === socket.id);
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
    if (!currentUserId) return;
    leaveRoom({ roomId, userId: currentUserId });
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center space-x-6 w-full">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            CodeCollab
          </h1>
        </Link>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  toast("Room ID copied to clipboard");
                }}
              >
                <Copy size={16} />
                {roomId}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Room ID</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center space-x-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full"
              onClick={handleRoomLeave}
            >
              <LogOutIcon size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Leave Room</TooltipContent>
        </Tooltip>

        <TooltipProvider>
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {visibleParticipants.map((user) => (
                <Tooltip key={user.userId}>
                  <TooltipTrigger asChild>
                    <div className="relative select-none">
                      <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-900">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-medium",
                            user.userId === currentUserId
                              ? "bg-black text-white"
                              : "bg-blue-100 text-blue-800"
                          )}
                        >
                          {user?.name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          "absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white dark:border-gray-900",
                          user.socketId ? "bg-green-500" : "bg-gray-400"
                        )}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.name || "Unknown"}</p>
                  </TooltipContent>
                </Tooltip>
              ))}

              {remainingCount > 0 && (
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 text-xs text-gray-800 dark:text-gray-200 border-2 border-white dark:border-gray-900">
                  +{remainingCount}
                </div>
              )}
            </div>
          </div>
        </TooltipProvider>
      </div>
    </header>
  );
};
