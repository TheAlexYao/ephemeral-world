import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { chatRooms, sessionLogs, users } from '@/drizzle/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all active rooms where the user has an active session
    const activeRooms = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.active, true))
      .innerJoin(
        sessionLogs,
        and(
          eq(sessionLogs.roomId, chatRooms.roomId),
          eq(sessionLogs.userId, session.user.id),
          isNull(sessionLogs.leaveTime)
        )
      )
      .innerJoin(users, eq(users.id, sessionLogs.userId))
      .execute();

    // Group by room and extract participants
    const roomsMap = activeRooms.reduce((acc, row) => {
      if (!acc[row.chat_rooms.roomId]) {
        acc[row.chat_rooms.roomId] = {
          roomId: row.chat_rooms.roomId,
          createdBy: row.chat_rooms.createdBy,
          createdAt: row.chat_rooms.createdAt,
          deepLink: row.chat_rooms.deepLink,
          participants: []
        };
      }
      
      // Add participant if not already added
      if (!acc[row.chat_rooms.roomId].participants.find((p: { id: string; }) => p.id === row.users.id)) {
        acc[row.chat_rooms.roomId].participants.push({
          id: row.users.id,
          name: row.users.name || '',
          verified: row.users.orb_verified || row.users.device_verified || false
        });
      }
      
      return acc;
    }, {} as Record<string, any>);

    const rooms = Object.values(roomsMap);

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
