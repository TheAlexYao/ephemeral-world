import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { chatRooms, sessionLogs } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { roomId } = params;

    // Check if room exists and is active
    const room = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.roomId, roomId))
      .execute();

    if (!room.length || !room[0].active) {
      return NextResponse.json(
        { error: "Room not found or inactive" },
        { status: 404 }
      );
    }

    // Check if user already has an active session
    const existingSession = await db
      .select()
      .from(sessionLogs)
      .where(
        and(
          eq(sessionLogs.roomId, roomId),
          eq(sessionLogs.userId, userId),
          isNull(sessionLogs.leaveTime)
        )
      )
      .execute();

    if (existingSession.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Already joined room"
      });
    }

    // Create new session log
    await db.insert(sessionLogs).values({
      sessionId: randomUUID(),
      roomId,
      userId,
      joinTime: new Date().toISOString(),
      leaveTime: null
    });

    return NextResponse.json({
      success: true,
      message: "Successfully joined room"
    });
  } catch (error) {
    console.error("Failed to join room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
