"use client";

import { useState, useCallback, useEffect } from "react";
import type { FileNode, FileTab } from "@repo/types";
import { useSocket } from "@/components/providers/socket-provider";
import { Sidebar } from "@/components/room/sidebar";
import { EditorTabs } from "./editor-tabs";
import { toast } from "sonner";
import { CodeEditor } from "./code-block";
import { v4 as uuidv4 } from "uuid";

interface EditorPageProps {
  roomId: string;
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

export default function RoomEditor({ roomId }: EditorPageProps) {
  const [openFiles, setOpenFiles] = useState<FileTab[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const { socket } = useSocket();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    let storedUserId = localStorage.getItem("userId");

    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem("userId", storedUserId);
    }

    setUserId(storedUserId);

    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setShowNameDialog(true);
    }
  }, []);

  const handleNameSubmit = () => {
    if (!nameInput.trim()) return;
    localStorage.setItem("username", nameInput.trim());
    setUsername(nameInput.trim());
    setShowNameDialog(false);
  };

  useEffect(() => {
    if (!roomId || !userId || !username || !socket) return;

    socket.emit("join-room", { roomId, userId, name: username });

    const handleUserJoined = (data: { userId: string; name: string }) => {
      if (data.userId === userId) toast.success("You joined the room");
      else toast.success(`${data.name} joined the room`);
    };

    const handleUserLeft = (data: { userId: string; name: string }) => {
      if (data.userId === userId) toast("You left the room");
      else toast(`${data.name} left the room`);
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.emit("leave-room", { roomId, userId });
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
    };
  }, [roomId, userId, username, socket]);

  useEffect(() => {
    if (!socket) return;

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
        code: file.code ?? "",
        language,
        dirty: false,
      };

      return [...prev, tab];
    });

    setActiveFileId(file.id);
  }, []);

  const handleEditorChange = useCallback(
    (code: string) => {
      if (!activeFileId || !socket) return;

      setOpenFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId ? { ...f, code, dirty: true } : f
        )
      );

      socket.emit("code-change", { roomId, fileId: activeFileId, code });
    },
    [activeFileId, roomId, socket]
  );

  const handleCloseFile = useCallback((id: string) => {
    setOpenFiles((prev) => prev.filter((f) => f.id !== id));
    setActiveFileId((prev) => (prev === id ? null : prev));
  }, []);

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  if (showNameDialog) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1e1e1e] text-white">
        <div className="bg-[#252526] p-8 rounded-lg shadow-xl w-full max-w-md border border-[#333]">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Enter your name
          </h2>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your display name"
            className="w-full bg-[#1e1e1e] border border-[#333] rounded px-4 py-3 text-white mb-4 focus:outline-none focus:border-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
          />
          <button
            onClick={handleNameSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors"
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  if (!username || !userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1e1e1e] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white overflow-hidden">
      <Sidebar roomId={roomId} onSelectFile={handleFileSelect} />

      <div className="flex-1 flex flex-col min-w-0">
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
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#1e1e1e]">
            <div className="text-center">
              <p className="text-xl font-semibold mb-2">
                Welcome to CodeCollab
              </p>
              <p className="text-sm">
                Select a file from the sidebar to start coding
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
