import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import redis from "@/lib/redis";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Message {
  userId: string;
  message: string;
  timestamp: string;
  messageId?: string;
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 60; // 60 messages per minute
const messageCounters = new Map<string, { count: number; resetTime: number }>();

// Input sanitization
function sanitizeMessage(message: string): string {
  return message.trim().slice(0, 1000); // Limit message length to 1000 characters
}

export async function POST(req: NextRequest) {
  try {
    const { roomId, message, userId } = await req.json();

    if (!roomId || !message || !userId) {
      return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Rate limiting
    const now = Date.now();
    const userKey = `${userId}:${roomId}`;
    const userCounter = messageCounters.get(userKey) || { count: 0, resetTime: now };

    // Reset counter if window has passed
    if (now > userCounter.resetTime + RATE_LIMIT_WINDOW) {
      userCounter.count = 0;
      userCounter.resetTime = now;
    }

    // Check rate limit
    if (userCounter.count >= MAX_MESSAGES_PER_WINDOW) {
      return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded' }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Increment counter
    userCounter.count++;
    messageCounters.set(userKey, userCounter);

    // Sanitize message
    const sanitizedMessage = sanitizeMessage(message);
    if (!sanitizedMessage) {
      return new NextResponse(JSON.stringify({ error: 'Message cannot be empty' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create message object with unique ID
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const messageObject: Message = {
      messageId,
      userId,
      message: sanitizedMessage,
      timestamp: new Date().toISOString()
    };

    // Store message in Redis with 60s TTL
    await redis.hset(`room:${roomId}:messages`, {
      [messageId]: JSON.stringify(messageObject)
    });
    await redis.expire(`room:${roomId}:messages`, 60);

    // Sanitize room ID and create channel name
    const sanitizedRoomId = roomId.replace(/[^a-zA-Z0-9-_]/g, '');
    const channelName = `presence-room-${sanitizedRoomId}`;

    try {
      // Trigger Pusher event
      await pusherServer.trigger(
        channelName,
        'new-message',
        messageObject
      );

      // Schedule message expiration event
      setTimeout(async () => {
        try {
          await pusherServer.trigger(
            channelName,
            'message_expired',
            { messageId }
          );
        } catch (error) {
          console.error('Error sending message expiration event:', error);
        }
      }, 60000);
    } catch (error) {
      console.error('Error triggering Pusher event:', error);
      throw error;
    }

    return new NextResponse(JSON.stringify({ success: true, messageId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in POST handler:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    
    // Handle Redis connection errors
    if (error instanceof Error && (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('Redis connection') ||
      error.message.includes('wrong version number')
    )) {
      return new NextResponse(JSON.stringify({ 
        error: 'Database connection error',
        details: error.message
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle Pusher errors
    if (error instanceof Error && error.message.includes('Pusher')) {
      return new NextResponse(JSON.stringify({ 
        error: 'Message service error',
        details: error.message
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.name : typeof error
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}