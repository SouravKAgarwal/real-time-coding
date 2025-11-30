"use client";

import { useState } from "react";
import { FileExplorer } from "@/components/file-explorer";
import { ParticipantsList } from "@/components/room/participants-list";
import { FileNode } from "@repo/types";
import { Files, Users } from "lucide-react";

interface SidebarProps {
  roomId: string;
  onSelectFile: (file: FileNode) => void;
}

export function Sidebar({ roomId, onSelectFile }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"files" | "participants">("files");

  return (
    <div className="w-64 bg-[#1e1e1e] border-r border-[#333] flex flex-col h-full">
      <div className="flex border-b border-[#333]">
        <button
          onClick={() => setActiveTab("files")}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            activeTab === "files"
              ? "text-blue-400 border-b-2 border-blue-400 bg-[#252526]"
              : "text-gray-400 hover:text-gray-200 hover:bg-[#252526]"
          }`}
        >
          <Files size={16} />
          Files
        </button>
        <button
          onClick={() => setActiveTab("participants")}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            activeTab === "participants"
              ? "text-blue-400 border-b-2 border-blue-400 bg-[#252526]"
              : "text-gray-400 hover:text-gray-200 hover:bg-[#252526]"
          }`}
        >
          <Users size={16} />
          Participants
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "files" ? (
          <FileExplorer roomId={roomId} onSelectFile={onSelectFile} />
        ) : (
          <ParticipantsList roomId={roomId} />
        )}
      </div>
    </div>
  );
}
