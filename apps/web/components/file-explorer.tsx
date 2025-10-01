"use client";

import { useEffect, useState, useRef } from "react";
import { FileNode } from "@repo/types";
import {
  IconChevronRight,
  IconChevronDown,
  IconFile,
  IconFolder,
  IconFolderOpen,
  IconTrash,
  IconEdit,
  IconFilePlus,
  IconFolderPlus,
} from "@tabler/icons-react";
import {
  createFile,
  deleteFile,
  renameFile,
  moveFile,
  onFilesUpdate,
} from "@/lib/socket";

interface FileExplorerProps {
  roomId: string;
  onSelectFile: (file: FileNode) => void;
}

export function FileExplorer({ roomId, onSelectFile }: FileExplorerProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const off = onFilesUpdate(roomId, (fileTree) => {
      setFiles(fileTree);
    });
    return () => off();
  }, [roomId]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRename = (id: string, name: string) => {
    if (!name.trim()) {
      return;
    }
    renameFile(roomId, id, name.trim());
  };

  const handleDelete = (id: string) => {
    deleteFile(roomId, id);
  };

  const handleAdd = (parentId: string | null, type: "file" | "folder") => {
    const id = crypto.randomUUID().slice(0, 6);
    const name = ""; 
    createFile(roomId, id, name, type, parentId);

    if (parentId) {
      setExpanded((prev) => {
        const next = new Set(prev);
        next.add(parentId);
        return next;
      });
    }

    setEditingId(id);
    setNewName(name);
  };

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingId(nodeId);
  };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingId || draggingId === targetId) return;
    moveFile(roomId, draggingId, targetId);
    setDraggingId(null);
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expanded.has(node.id);

    return (
      <div
        key={node.id}
        draggable={node.type === "file"}
        onDragStart={(e) => onDragStart(e, node.id)}
        onDragOver={(e) => {
          if (node.type === "folder") e.preventDefault();
        }}
        onDrop={(e) => {
          if (node.type === "folder") onDrop(e, node.id);
        }}
      >
        <div
          className={`flex items-center px-2 py-1 text-sm cursor-pointer hover:bg-gray-700 ${
            node.type === "folder" && isExpanded ? "font-medium" : ""
          }`}
          style={{ paddingLeft: depth * 2 }}
          onClick={() =>
            node.type === "file" ? onSelectFile(node) : toggleExpand(node.id)
          }
        >
          {node.type === "folder" ? (
            isExpanded ? (
              <IconChevronDown size={14} />
            ) : (
              <IconChevronRight size={14} />
            )
          ) : (
            <span className="w-[14px]" />
          )}

          {node.type === "folder" ? (
            isExpanded ? (
              <IconFolderOpen size={16} className="mr-1 text-[#4EC9B0]" />
            ) : (
              <IconFolder size={16} className="mr-1 text-[#4EC9B0]" />
            )
          ) : (
            <IconFile size={16} className="mr-1 text-blue-400" />
          )}

          {editingId === node.id ? (
            <input
              ref={inputRef}
              className="bg-gray-800 text-white px-1 text-xs flex-1 rounded"
              value={newName}
              autoFocus
              placeholder={node.type === "file" ? "new file" : "new folder"}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => {
                handleRename(node.id, newName);
                setEditingId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename(node.id, newName);
                  setEditingId(null);
                }
              }}
            />
          ) : (
            <span className="flex-1 truncate">
              {node.name || (
                <span className="italic text-gray-500">untitled</span>
              )}
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingId(node.id);
              setNewName(node.name);
            }}
            className="ml-1 text-gray-400 hover:text-white"
          >
            <IconEdit size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(node.id);
            }}
            className="ml-1 text-gray-400 hover:text-red-500"
          >
            <IconTrash size={12} />
          </button>
          {node.type === "folder" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd(node.id, "file");
                }}
                className="ml-1 text-gray-400 hover:text-green-500"
              >
                <IconFilePlus size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd(node.id, "folder");
                }}
                className="ml-1 text-gray-400 hover:text-yellow-400"
              >
                <IconFolderPlus size={12} />
              </button>
            </>
          )}
        </div>

        {node.type === "folder" && isExpanded && (
          <div className="ml-2">
            {node.children?.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-[#1e1e1e] text-gray-200 flex flex-col select-none border-r border-[#434346]">
      <div className="flex justify-between items-center px-2 py-2 border-b border-[#434346]">
        <span className="font-semibold text-xs uppercase tracking-wide text-gray-400">
          Explorer
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => handleAdd(null, "file")}
            className="text-gray-400 hover:text-green-500"
            title="New File"
          >
            <IconFilePlus size={16} />
          </button>
          <button
            onClick={() => handleAdd(null, "folder")}
            className="text-gray-400 hover:text-yellow-400"
            title="New Folder"
          >
            <IconFolderPlus size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 px-2 py-1">
        {files.map((f) => renderNode(f))}
      </div>
    </div>
  );
}
