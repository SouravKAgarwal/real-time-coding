"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, Code2, Users } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  const handleCreateRoom = () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    const newRoomId = uuidv4();
    localStorage.setItem("username", username);
    router.push(`/room/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (!username.trim() || !roomId.trim()) {
      toast.error("Please enter both username and room ID");
      return;
    }
    localStorage.setItem("username", username);
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Code2 className="w-12 h-12 text-blue-500" />
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            CodeCollab
          </h1>
        </div>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Real-time collaborative coding environment for teams and friends.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="z-10 w-full max-w-md bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex gap-4 mb-8 p-1 bg-gray-800/50 rounded-xl">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "create"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => setActiveTab("join")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "join"
                ? "bg-purple-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Join Room
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your display name"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {activeTab === "join" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Room ID
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </motion.div>
          )}

          <button
            onClick={activeTab === "create" ? handleCreateRoom : handleJoinRoom}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
              activeTab === "create"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-500/25"
                : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-purple-500/25"
            }`}
          >
            {activeTab === "create" ? (
              <>
                Create New Room <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Join Existing Room <Users className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
