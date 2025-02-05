import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';
import redis from '@/lib/redis';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    const { message, userId, roomId } = await req.json();
    
    const messageId = nanoid();
    const timestamp = new Date().toISOString();
    
    const messageData = {
      messageId,
      userId,
      message,
      timestamp,
    };

    // Store message in Redis with 60s TTL
    await redis.setex(`message:${roomId}:${messageId}`, 60, JSON.stringify(messageData));

    // Trigger real-time update via Pusher
    await pusherServer.trigger(`room-${roomId}`, 'new-message', messageData);

    return NextResponse.json({ success: true, messageId });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    // Get all messages for the room from Redis
    const keys = await redis.keys(`message:${roomId}:*`);
    const messages = await Promise.all(
      keys.map(async (key) => {
        const message = await redis.get(key);
        return message ? JSON.parse(message) : null;
      })
    );

    return NextResponse.json({ messages: messages.filter(Boolean) });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
