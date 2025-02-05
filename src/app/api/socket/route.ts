import { Server } from "socket.io";
import { NextRequest, NextResponse } from "next/server";
import type { Socket } from "socket.io";
import redis from "@/lib/redis";

// Store active rooms and their sockets
const rooms = new Map<string, Set<string>>();

declare global {
  var io: Server;
}

if (!global.io) {
  global.io = new Server({
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
}

const io = global.io;

io.on("connection", (socket: Socket) => {
  console.log("Client connected:", socket.id);

  // Join a room
  socket.on("join_room", async (roomId: string, userId: string) => {
    try {
      // Add user to room
      socket.join(roomId);
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId)?.add(userId);

      // Notify room about new user
      io.to(roomId).emit("user_joined", {
        userId,
        timestamp: new Date().toISOString(),
      });

      // Store join time in Redis
      await redis.hset(`room:${roomId}:users`, {
        [userId]: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", "Failed to join room");
    }
  });

  // Handle chat message
  socket.on("message", async (data: { roomId: string; userId: string; message: string }) => {
    try {
      const { roomId, userId, message } = data;
      const timestamp = new Date().toISOString();

      // Store message in Redis with 60s TTL
      const messageId = `${roomId}:${timestamp}`;
      await redis.hset(`room:${roomId}:messages`, {
        [messageId]: JSON.stringify({ userId, message, timestamp }),
      });
      await redis.expire(`room:${roomId}:messages`, 60);

      // Broadcast to room
      io.to(roomId).emit("message", {
        userId,
        message,
        timestamp,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", "Failed to send message");
    }
  });

  // Leave room
  socket.on("leave_room", async (roomId: string, userId: string) => {
    try {
      socket.leave(roomId);
      rooms.get(roomId)?.delete(userId);
      
      // Notify room
      io.to(roomId).emit("user_left", {
        userId,
        timestamp: new Date().toISOString(),
      });

      // Update Redis
      await redis.hdel(`room:${roomId}:users`, userId);
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    // Clean up any rooms this socket was in
    rooms.forEach((users, roomId) => {
      users.forEach(async (userId) => {
        if (socket.rooms.has(roomId)) {
          users.delete(userId);
          io.to(roomId).emit("user_left", {
            userId,
            timestamp: new Date().toISOString(),
          });
          await redis.hdel(`room:${roomId}:users`, userId);
        }
      });
    });
  });
});

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // @ts-ignore - req.socket is available in Edge Runtime
  await io.attach(req.socket);
  return new NextResponse(null, { status: 200 });
} 