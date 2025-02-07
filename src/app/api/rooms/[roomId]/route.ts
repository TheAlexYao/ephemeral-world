import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chatRooms, sessionLogs, users } from '@/drizzle/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { Session } from 'next-auth';
import { ChatRoom } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    // Fetch the chat room with active sessions
    const room = await db
      .select({
        roomId: chatRooms.roomId,
        active: chatRooms.active,
        createdBy: chatRooms.createdBy,
        createdAt: chatRooms.createdAt,
        deepLink: chatRooms.deepLink,
        user: {
          id: users.id,
          name: users.name,
          verified: users.orb_verified
        }
      })
      .from(chatRooms)
      .where(eq(chatRooms.roomId, params.roomId))
      .innerJoin(
        sessionLogs,
        and(
          eq(sessionLogs.roomId, chatRooms.roomId),
          isNull(sessionLogs.leaveTime)
        )
      )
      .innerJoin(users, eq(users.id, sessionLogs.userId))
      .execute();

    if (!room.length || !room[0].active) {
      return new NextResponse('Room not found', { status: 404 });
    }

    // Extract unique participants
    const participants = Array.from(new Set(room.map(r => r.user.id))).map(userId => {
      const user = room.find(r => r.user.id === userId)?.user;
      return {
        id: user?.id || '',
        name: user?.name || '',
        verified: user?.verified || false
      };
    });

    const roomData: ChatRoom = {
      roomId: room[0].roomId ?? '',
      createdBy: room[0].createdBy ?? '',
      createdAt: room[0].createdAt ?? new Date().toISOString(),
      deepLink: room[0].deepLink ?? '',
      participants
    };

    return NextResponse.json(roomData);
  } catch (error) {
    console.error('Failed to fetch room:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
