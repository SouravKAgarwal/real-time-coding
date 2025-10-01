"use client";

import { useState, useCallback, useEffect } from "react";
import type { FileNode, FileTab } from "@repo/types";
import {
  getSocket,
  joinRoom,
  leaveRoom,
  emitCodeChange,
  onUserJoined,
  onUserLeft,
} from "@/lib/socket";
import { FileExplorer } from "./file-explorer";
import { EditorTabs } from "./editor-tabs";
import { toast } from "sonner";
import { CodeEditor } from "./code-block";

interface EditorPageProps {
  roomId: string;
  userId: string;
  username: string;
}

const languageMap: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  rb: "ruby",
  go: "go",
  rs: "rust",
  sh: "shell",
  php: "php",
  java: "java",
  c: "c",
  cpp: "cpp",
  h: "cpp",
  cs: "csharp",
  swift: "swift",
  kt: "kotlin",
  scala: "scala",
  m: "objective-c",
  html: "html",
  json: "json",
};

export default function EditorPage({
  roomId,
  userId,
  username,
}: EditorPageProps) {
  const [openFiles, setOpenFiles] = useState<FileTab[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const socket = getSocket();

  useEffect(() => {
    if (!roomId || !userId) return;

    joinRoom({ roomId, userId, name: username });

    return () => {
      leaveRoom({ roomId, userId });
    };
  }, [roomId, userId, username]);

  useEffect(() => {
    const handleCodeChange = (payload: { fileId: string; code: string }) => {
      setOpenFiles((prev) =>
        prev.map((f) =>
          f.id === payload.fileId ? { ...f, code: payload.code } : f
        )
      );
    };

    socket.on("code-change", handleCodeChange);
    return () => {
      socket.off("code-change", handleCodeChange);
    };
  }, [socket]);

  const handleFileSelect = useCallback((file: FileNode) => {
    if (file.type !== "file") return;

    setOpenFiles((prev) => {
      if (prev.find((f) => f.id === file.id)) return prev;

      const extension = file.name.split(".").pop()?.toLowerCase() || "txt";
      const language = languageMap[extension] || "text";

      const tab: FileTab = {
        id: file.id,
        name: file.name,
        code: (file as any).code ?? "",
        language,
        dirty: false,
      };

      return [...prev, tab];
    });

    setActiveFileId(file.id);
  }, []);

  const handleEditorChange = useCallback(
    (code: string) => {
      if (!activeFileId) return;

      setOpenFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId ? { ...f, code, dirty: true } : f
        )
      );

      emitCodeChange({ roomId, fileId: activeFileId, code });
    },
    [activeFileId, roomId]
  );

  const handleCloseFile = useCallback((id: string) => {
    setOpenFiles((prev) => prev.filter((f) => f.id !== id));
    setActiveFileId((prev) => (prev === id ? null : prev));
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const unsubJoined = onUserJoined(roomId, (user) => {
      if (user.userId === userId) toast.success("You joined the room");
      else toast.success(`${user.name} joined the room`);
    });

    const unsubLeft = onUserLeft(roomId, (user) => {
      if (user.userId === userId) toast("You left the room");
      else toast(`${user.name} left the room`);
    });

    return () => {
      unsubJoined();
      unsubLeft();
    };
  }, [roomId, userId]);

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white">
      <FileExplorer roomId={roomId} onSelectFile={handleFileSelect} />

      <div className="flex-1 flex flex-col">
        <EditorTabs
          files={openFiles}
          activeFileId={activeFileId}
          onActivate={setActiveFileId}
          onClose={handleCloseFile}
        />

        {activeFile ? (
          <CodeEditor
            activeFile={activeFile}
            onChange={(value) => handleEditorChange(value ?? "")}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <span>Select a file to start editing</span>
          </div>
        )}
      </div>
    </div>
  );
}
