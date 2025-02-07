import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chatRooms, sessionLogs, users } from '@/drizzle/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { ChatRoom } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    // First fetch the room details
    const [roomDetails] = await db
      .select({
        roomId: chatRooms.roomId,
        name: chatRooms.name,
        active: chatRooms.active,
        createdBy: chatRooms.createdBy,
        createdAt: chatRooms.createdAt,
        deepLink: chatRooms.deepLink,
      })
      .from(chatRooms)
      .where(eq(chatRooms.roomId, params.roomId))
      .execute();

    if (!roomDetails || !roomDetails.active) {
      return new NextResponse('Room not found', { status: 404 });
    }

    // Then fetch active participants
    const participants = await db
      .select({
        user: {
          id: users.id,
          name: users.name,
          verified: users.orb_verified
        }
      })
      .from(sessionLogs)
      .where(
        and(
          eq(sessionLogs.roomId, params.roomId),
          isNull(sessionLogs.leaveTime)
        )
      )
      .innerJoin(users, eq(users.id, sessionLogs.userId))
      .execute();

    // Extract unique participants
    const uniqueParticipants = Array.from(
      new Set(participants.map(p => p.user.id))
    ).map(userId => {
      const participant = participants.find(p => p.user.id === userId)?.user;
      return {
        id: participant?.id || '',
        name: participant?.name || '',
        verified: participant?.verified || false
      };
    });

    const roomData: ChatRoom = {
      roomId: roomDetails.roomId,
      name: roomDetails.name,
      createdBy: roomDetails.createdBy,
      createdAt: roomDetails.createdAt ?? new Date().toISOString(),
      deepLink: roomDetails.deepLink,
      participants: uniqueParticipants
    };

    return NextResponse.json(roomData);
  } catch (error) {
    console.error('Failed to fetch room:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
