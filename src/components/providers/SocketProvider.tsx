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
    // Initialize socket connection
    const socketInstance = io(
      process.env.NODE_ENV === "production"
        ? "https://your-domain.com"
        : "http://localhost:3000",
      {
        path: "/api/socketio",
      }
    );

    // Connection event handlers
    socketInstance.on("connect", () => {
      console.log("Connected to Socket.io server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from Socket.io server");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket.io connection error:", error);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.close();
    };
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
