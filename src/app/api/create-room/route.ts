import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { chatRooms } from "@/drizzle/schema";

// Encode the path for the deep link URL
function encodeRoomPath(roomId: string) {
  return encodeURIComponent(`/room/${roomId}`);
}

export async function POST(req: NextRequest) {
  try {
    // Generate a unique room ID
    const roomId = randomUUID();

    // Create the World-compatible deep link
    const deepLink = `https://worldcoin.org/mini-app?app_id=${process.env.APP_ID}&path=${encodeRoomPath(roomId)}`;

    // Store room info in Turso DB
    await db.insert(chatRooms).values({
      roomId,
      createdBy: "anonymous", // TODO: Replace with actual user ID once auth is integrated
      deepLink,
      active: true,
    });

    return NextResponse.json({
      success: true,
      roomId,
      deepLink
    });
  } catch (error: any) {
    console.error("Room creation error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 