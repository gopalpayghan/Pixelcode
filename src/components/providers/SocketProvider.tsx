"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@clerk/nextjs";

interface Position {
  lineNumber: number;
  column: number;
}

interface Selection {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  emitCodeChange: (roomId: string, code: string, language: string) => void;
  emitCursorChange: (
    roomId: string,
    position: Position,
    selection?: Selection
  ) => void;
  emitLanguageChange: (roomId: string, language: string) => void;
  emitCodeExecution: (roomId: string, code: string, language: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
  emitCodeChange: () => {},
  emitCursorChange: () => {},
  emitLanguageChange: () => {},
  emitCodeExecution: () => {},
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    // Only initialize socket if we're not in development or if the Socket.IO server is expected to be running
    if (
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ENABLE_SOCKETIO === "true"
    ) {
      // Get the current window location for dynamic port detection
      const socketUrl =
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_VERCEL_URL
            ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
            : "https://your-pixelcode-app.vercel.app"
          : typeof window !== "undefined"
            ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
            : "http://localhost:3000"; // Default to port 3000 for Next.js dev server

      console.log("Attempting to connect to Socket.IO server at:", socketUrl);

      // Initialize socket connection
      const socketInstance = io(socketUrl, {
        path: "/api/socketio",
        transports: ["polling", "websocket"], // Try polling first, then websocket
        timeout: 10000,
        forceNew: true,
        autoConnect: true,
      });

      // Connection event handlers
      socketInstance.on("connect", () => {
        console.log("✅ Connected to Socket.io server");
        setIsConnected(true);
      });

      socketInstance.on("disconnect", () => {
        console.log("❌ Disconnected from Socket.io server");
        setIsConnected(false);
      });

      socketInstance.on("connect_error", () => {
        // Silently handle connection errors in development
        console.warn(
          "⚠️ Socket.io connection unavailable - collaborative features disabled"
        );
        setIsConnected(false);
        // Don't throw or log error to prevent React error overlay
      });

      setSocket(socketInstance);

      // Cleanup on unmount
      return () => {
        socketInstance.close();
      };
    } else {
      // In development without Socket.IO enabled, just set socket to null
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  const joinRoom = (roomId: string) => {
    if (socket && user) {
      console.log("Client joining room:", {
        socketId: socket.id,
        roomId,
        userName: user.fullName || user.firstName || "Anonymous",
      });
      socket.emit("join-room", {
        roomId,
        user: {
          name: user.fullName || user.firstName || "Anonymous",
          email: user.primaryEmailAddress?.emailAddress,
          avatar: user.imageUrl,
        },
      });
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit("leave-room", { roomId });
    }
  };

  const emitCodeChange = (roomId: string, code: string, language: string) => {
    if (socket) {
      socket.emit("code-change", { roomId, code, language });
    }
  };

  const emitCursorChange = (
    roomId: string,
    position: Position,
    selection?: Selection
  ) => {
    if (socket) {
      socket.emit("cursor-change", { roomId, position, selection });
    }
  };

  const emitLanguageChange = (roomId: string, language: string) => {
    if (socket) {
      socket.emit("language-change", { roomId, language });
    }
  };

  const emitCodeExecution = (
    roomId: string,
    code: string,
    language: string
  ) => {
    if (socket) {
      socket.emit("code-execute", { roomId, code, language });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinRoom,
        leaveRoom,
        emitCodeChange,
        emitCursorChange,
        emitLanguageChange,
        emitCodeExecution,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
