import { Server } from "socket.io";
import { NextRequest, NextResponse } from "next/server";
import type { Socket } from "socket.io";
import redis from "@/lib/redis";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Store active rooms and their sockets
const rooms = new Map<string, Set<string>>();

// Define the global io variable
declare global {
  var io: Server | null;
}

if (typeof global.io === 'undefined') {
  global.io = null;
}

// Rate limiting configuration
const rateLimits = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 30;

// Input sanitization
function sanitizeMessage(message: string): string {
  return message.trim().slice(0, 1000); // Limit message length
}

function setupSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    // Rate limiting check
    function checkRateLimit(userId: string): boolean {
      const now = Date.now();
      const userLimit = rateLimits.get(userId);

      if (!userLimit) {
        rateLimits.set(userId, { count: 1, lastReset: now });
        return true;
      }

      if (now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
        rateLimits.set(userId, { count: 1, lastReset: now });
        return true;
      }

      if (userLimit.count >= MAX_MESSAGES_PER_WINDOW) {
        return false;
      }

      userLimit.count++;
      return true;
    }

    // Join a room
    socket.on("join_room", async (roomId: string, userId: string) => {
      try {
        if (!roomId || !userId) {
          throw new Error("Invalid room or user ID");
        }

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

        // Load recent messages from Redis
        const recentMessages = await redis.hgetall(`room:${roomId}:messages`);
        if (recentMessages) {
          socket.emit("recent_messages", Object.entries(recentMessages).map(([id, msg]) => ({
            ...JSON.parse(msg),
            messageId: id,
          })));
        }
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", "Failed to join room");
      }
    });

    // Handle chat message
    socket.on("message", async (data: { roomId: string; userId: string; message: string }) => {
      try {
        const { roomId, userId, message } = data;
        
        // Validate input
        if (!roomId || !userId || !message) {
          throw new Error("Missing required fields");
        }

        // Check rate limit
        if (!checkRateLimit(userId)) {
          socket.emit("error", "Rate limit exceeded. Please wait before sending more messages.");
          return;
        }

        // Sanitize message
        const sanitizedMessage = sanitizeMessage(message);
        if (!sanitizedMessage) {
          socket.emit("error", "Invalid message content");
          return;
        }

        const timestamp = new Date().toISOString();
        const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Store message in Redis with 60s TTL
        await redis.hset(`room:${roomId}:messages`, {
          [messageId]: JSON.stringify({ userId, message: sanitizedMessage, timestamp }),
        });
        await redis.expire(`room:${roomId}:messages`, 60);

        // Broadcast to room
        io.to(roomId).emit("message", {
          messageId,
          userId,
          message: sanitizedMessage,
          timestamp,
        });

        // Set up message expiration notification
        setTimeout(() => {
          io.to(roomId).emit("message_expired", { messageId });
        }, 60000);
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
};

export async function GET(req: NextRequest) {
  try {
    // Initialize Socket.IO if not already initialized
    if (!global.io) {
      global.io = new Server({
        path: "/api/socket",
        addTrailingSlash: false,
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      });
      setupSocketHandlers(global.io);
    }

    // @ts-ignore - req.socket is available in Edge Runtime
    await global.io.attach(req.socket);
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Socket attachment error:', error);
    return new NextResponse('Failed to attach socket', { status: 500 });
  }
}