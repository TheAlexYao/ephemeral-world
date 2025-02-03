import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatRooms } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // 1. Create a room via the create-room endpoint
    const createResponse = await fetch(new URL('/api/create-room', req.url), {
      method: 'POST',
    });
    const { roomId, deepLink } = await createResponse.json();

    // 2. Verify the room exists in the database
    const room = await db.query.chatRooms.findFirst({
      where: eq(chatRooms.roomId, roomId),
    });

    // 3. Return test results
    return NextResponse.json({
      success: true,
      test_results: {
        room_created: !!room,
        room_data: room,
        deep_link: deepLink,
        deep_link_valid: deepLink.includes(process.env.APP_ID!),
      }
    });
  } catch (error: any) {
    console.error("Room test error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 