import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { Socket as NetSocket } from "net";

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  cursor?: Position | null;
  selection?: Selection | null;
}

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

interface CodeDelta {
  changes: Array<{
    range: Selection;
    text: string;
  }>;
}

interface SocketServer extends NetServer {
  io?: ServerIO;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseServerIO extends NextApiResponse {
  socket: SocketWithIO;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("Setting up socket.io server...");
    const io = new ServerIO(res.socket.server, {
      path: "/api/socketio",
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? ["https://your-domain.com"] // Replace with your actual domain
            : ["http://localhost:3000"],
        credentials: true,
      },
    });

    // Store active users in each room
    const activeUsers = new Map<string, Map<string, User>>();
    const userRooms = new Map<string, string>();

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      // Handle joining a collaborative room (snippet)
      socket.on(
        "join-room",
        (data: { roomId: string; user: Partial<User> }) => {
          const { roomId, user } = data;

          console.log("User joining room:", {
            socketId: socket.id,
            roomId: roomId,
            userName: user.name,
          });

          // Leave previous room if any
          const previousRoom = userRooms.get(socket.id);
          if (previousRoom) {
            socket.leave(previousRoom);
            const roomUsers = activeUsers.get(previousRoom);
            if (roomUsers) {
              roomUsers.delete(socket.id);
              socket.to(previousRoom).emit("user-left", { userId: socket.id });
            }
          }

          // Join new room
          socket.join(roomId);
          userRooms.set(socket.id, roomId);

          if (!activeUsers.has(roomId)) {
            activeUsers.set(roomId, new Map());
          }

          const roomUsers = activeUsers.get(roomId)!;
          roomUsers.set(socket.id, {
            id: socket.id,
            name: user.name || "Anonymous",
            email: user.email,
            avatar: user.avatar,
            cursor: null,
            selection: null,
          });

          console.log("Room users after join:", {
            roomId: roomId,
            userCount: roomUsers.size,
            users: Array.from(roomUsers.keys()),
          });

          // Send current users to the joining user
          socket.emit("room-users", Array.from(roomUsers.values()));

          // Notify others about new user
          socket.to(roomId).emit("user-joined", {
            id: socket.id,
            name: user.name || "Anonymous",
            email: user.email,
            avatar: user.avatar,
          });

          console.log(`User ${socket.id} joined room ${roomId}`);
        }
      );

      // Handle code changes - Optimized for INSTANT transmission
      socket.on(
        "code-change",
        (data: {
          roomId: string;
          code: string;
          language: string;
          delta?: CodeDelta;
        }) => {
          // Immediately broadcast without any logging delays
          socket.to(data.roomId).emit("code-update", {
            code: data.code,
            language: data.language,
            delta: data.delta,
            userId: socket.id,
          });
        }
      );

      // Handle cursor position updates
      socket.on(
        "cursor-change",
        (data: {
          roomId: string;
          position: Position;
          selection?: Selection;
        }) => {
          const roomUsers = activeUsers.get(data.roomId);
          if (roomUsers && roomUsers.has(socket.id)) {
            const user = roomUsers.get(socket.id)!;
            user.cursor = data.position;
            user.selection = data.selection;

            socket.to(data.roomId).emit("cursor-update", {
              userId: socket.id,
              position: data.position,
              selection: data.selection,
              user: user,
            });
          }
        }
      );

      // Handle language change
      socket.on(
        "language-change",
        (data: { roomId: string; language: string }) => {
          socket.to(data.roomId).emit("language-update", {
            language: data.language,
            userId: socket.id,
          });
        }
      );

      // Handle code execution
      socket.on(
        "code-execute",
        (data: { roomId: string; code: string; language: string }) => {
          socket.to(data.roomId).emit("code-execution", {
            code: data.code,
            language: data.language,
            userId: socket.id,
          });
        }
      );

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);

        const roomId = userRooms.get(socket.id);
        if (roomId) {
          const roomUsers = activeUsers.get(roomId);
          if (roomUsers) {
            roomUsers.delete(socket.id);
            socket.to(roomId).emit("user-left", { userId: socket.id });

            // Clean up empty rooms
            if (roomUsers.size === 0) {
              activeUsers.delete(roomId);
            }
          }
          userRooms.delete(socket.id);
        }
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;
