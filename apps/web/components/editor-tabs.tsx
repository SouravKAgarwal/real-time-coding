"use client";

import { FileTab } from "@repo/types";
import { IconX } from "@tabler/icons-react";

interface EditorTabsProps {
  files: FileTab[];
  activeFileId: string | null;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
}

export function EditorTabs({
  files,
  activeFileId,
  onActivate,
  onClose,
}: EditorTabsProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex bg-[#252526] border-b border-[#1e1e1e]">
      {files.map((file) => (
        <div
          key={file.id}
          className={`flex items-center border-r border-[#434346] px-3 py-2 text-sm cursor-pointer transition-colors
            ${
              activeFileId === file.id
                ? "bg-[#1e1e1e] text-white"
                : "bg-[#2d2d2d] text-gray-400 hover:bg-[#37373d]"
            }`}
          onClick={() => onActivate(file.id)}
        >
          <span className={`mr-2 ${file.dirty ? "text-yellow-400" : ""}`}>
            {file.name}
          </span>
          <button
            className="p-1 rounded-full hover:bg-[#3f3f46]"
            onClick={(e) => {
              e.stopPropagation();
              onClose(file.id);
            }}
          >
            <IconX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
