import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { chatRooms } from "@/drizzle/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import redis from "@/lib/redis";

// Rate limit configuration
const RATE_LIMIT = 10; // max requests
const RATE_LIMIT_WINDOW = 60; // in seconds
const RATE_LIMIT_WINDOW_MS = RATE_LIMIT_WINDOW * 1000;

// Encode the path for the deep link URL
function encodeRoomPath(roomId: string) {
  return encodeURIComponent(`/room/${roomId}`);
}

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check rate limit
    const rateKey = `rate_limit:create_room:${userId}`;
    const currentRequests = await redis.incr(rateKey);
    
    // Set expiry on first request
    if (currentRequests === 1) {
      await redis.expire(rateKey, RATE_LIMIT_WINDOW);
    }

    if (currentRequests > RATE_LIMIT) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded",
          resetIn: await redis.ttl(rateKey)
        },
        { status: 429 }
      );
    }

    // Generate a unique room ID
    const roomId = randomUUID();

    // Create the World-compatible deep link
    const deepLink = `https://worldcoin.org/mini-app?app_id=${process.env.APP_ID}&path=${encodeRoomPath(roomId)}`;

    // Store room info in Turso DB
    await db.insert(chatRooms).values({
      roomId,
      createdBy: userId,
      deepLink,
      active: true,
    });

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
    console.error("Room creation error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 