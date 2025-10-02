"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { PlusCircle, LogIn, Users } from "lucide-react";
import { getParticipants, getSocket } from "@/lib/socket";

const generate6CharId = () => uuid().replace(/-/g, "").slice(0, 6);

interface RoomProps {
  title?: string;
  subTitle?: string;
}

const Room = ({ title, subTitle }: RoomProps) => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [errors, setErrors] = useState<{ username?: string; roomId?: string }>(
    {}
  );
  const [participantsCount, setParticipantsCount] = useState<number>(0);

  const socket = getSocket();

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = getParticipants(roomId, (users) => {
      setParticipantsCount(users.length);
    });

    socket.emit("get-participants", { roomId });

    return () => unsubscribe();
  }, [roomId, socket]);

  const handleCreateRoom = () => {
    const newErrors: typeof errors = {};
    if (!username.trim()) newErrors.username = "Username is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const newRoomId = generate6CharId();
    router.push(`/room/${newRoomId}?username=${username.trim()}`);
  };

  const handleJoinRoom = () => {
    const newErrors: typeof errors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (!roomId.trim()) newErrors.roomId = "Room ID is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    router.push(`/room/${roomId.trim()}?username=${username.trim()}`);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-neutral-900/60 border border-gray-800 rounded-2xl shadow-lg p-6 backdrop-blur">
      <div className="text-center relative">
        <h1 className="text-4xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-gray-400">{subTitle}</p>
      </div>

      <div className="mb-4 mt-8">
        <label className="flex text-sm font-medium text-gray-300 mb-2">
          Your Name
        </label>
        <input
          type="text"
          placeholder="e.g. Alex"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={`w-full p-3 rounded-lg bg-neutral-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
            errors.username
              ? "border-red-500 focus:ring-red-500 shake"
              : "border-gray-700 focus:ring-blue-500"
          }`}
        />
        {errors.username && (
          <p className="flex text-red-500 text-sm mt-1">{errors.username}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-300 mb-2 flex justify-between items-center">
          <span>Room ID (to join existing)</span>
          {roomId && (
            <span className="text-xs flex items-center gap-1 text-gray-400">
              <Users className="w-3 h-3" /> {participantsCount} online
            </span>
          )}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className={`flex-1 p-3 rounded-lg bg-neutral-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
              errors.roomId
                ? "border-red-500 focus:ring-red-500 shake"
                : "border-gray-700 focus:ring-purple-500"
            }`}
          />

          <button
            onClick={handleJoinRoom}
            className="flex items-center gap-2 px-4 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
          >
            <LogIn className="w-4 h-4" />
            Join
          </button>
        </div>
        {errors.roomId && (
          <p className="flex text-red-500 text-sm mt-1">{errors.roomId}</p>
        )}
      </div>

      <div className="flex items-center mb-6">
        <div className="flex-1 h-px bg-gray-700"></div>
        <span className="px-4 text-sm text-gray-400">OR</span>
        <div className="flex-1 h-px bg-gray-700"></div>
      </div>

      <button
        onClick={handleCreateRoom}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition font-medium"
      >
        <PlusCircle className="w-5 h-5" />
        Create New Room
      </button>
    </div>
  );
};

export default Room;
