/**
 * Room Creation Route Handler
 * 
 * This module handles the creation of new chat rooms with features including:
 * - Authentication verification
 * - Rate limiting
 * - Unique room ID generation
 * - Deep link creation
 * - Persistent storage in Turso DB
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { chatRooms, sessionLogs } from "@/drizzle/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import redis from "@/lib/redis";

/**
 * Rate limiting configuration to prevent abuse
 */
const RATE_LIMIT = 10;                    // Maximum room creations per window
const RATE_LIMIT_WINDOW = 60;              // Window size in seconds
const RATE_LIMIT_WINDOW_MS = RATE_LIMIT_WINDOW * 1000;  // Window size in milliseconds

/**
 * Encodes a room path for use in deep links
 * Ensures the path is properly URL-encoded for World's mini-app protocol
 * 
 * @param roomId - Unique identifier for the room
 * @returns URL-encoded path string
 */
function encodeRoomPath(roomId: string) {
  return encodeURIComponent(`/room/${roomId}`);
}

// Use Node.js runtime for crypto support
export const runtime = 'nodejs';

/**
 * POST handler for creating new chat rooms
 * 
 * This handler performs the following steps:
 * 1. Verifies user authentication via WorldID
 * 2. Enforces rate limiting
 * 3. Generates unique room ID
 * 4. Creates World-compatible deep link
 * 5. Persists room data in Turso DB
 * 
 * @param req - Next.js request object
 * @returns JSON response with room details or error
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated with WorldID
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Implement rate limiting using Redis
    // Key format: rate_limit:create_room:{userId}
    const rateKey = `rate_limit:create_room:${userId}`;
    const currentRequests = await redis.incr(rateKey);
    
    // Set expiration window on first request
    if (currentRequests === 1) {
      await redis.expire(rateKey, RATE_LIMIT_WINDOW);
    }

    // Enforce rate limit
    if (currentRequests > RATE_LIMIT) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded",
          resetIn: await redis.ttl(rateKey)
        },
        { status: 429 }
      );
    }

    // Get room name from request body
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    // Generate cryptographically secure room ID
    const roomId = randomUUID();

    // Create World-compatible deep link with app ID and encoded path
    const deepLink = `https://worldcoin.org/mini-app?app_id=${process.env.APP_ID}&path=${encodeRoomPath(roomId)}`;

    // Persist room data in Turso DB
    await db.insert(chatRooms).values({
      roomId,
      name,
      createdBy: userId,
      deepLink,
      active: true,
    });

    // Create initial session log for room creator
    await db.insert(sessionLogs).values({
      sessionId: randomUUID(), // Generate a unique session ID
      roomId,
      userId,
      joinTime: new Date().toISOString(),
      leaveTime: null
    });

    // Return success response with room details
    return NextResponse.json({
      success: true,
      room: {
        id: roomId,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        active: true,
        deepLink,
        remainingRequests: RATE_LIMIT - currentRequests,
        resetIn: await redis.ttl(rateKey)
      }
    });
  } catch (error: any) {
    // Log error and return appropriate error response
    console.error("Room creation error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 