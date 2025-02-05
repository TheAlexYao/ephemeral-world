/**
 * Socket Route Handler
 * 
 * This module handles real-time messaging functionality including:
 * - Message retrieval (GET)
 * - Message sending (POST)
 * - Rate limiting
 * - Message sanitization
 * - Redis-based message storage with TTL
 * - Pusher WebSocket integration
 */

import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import redis from "@/lib/redis";

// Force dynamic rendering to ensure real-time data
export const dynamic = 'force-dynamic';
// Use Node.js runtime for WebSocket support
export const runtime = 'nodejs';

/**
 * Message interface defining the structure of chat messages
 */
interface Message {
  userId: string;      // Unique identifier of the message sender
  message: string;     // Content of the message
  timestamp: string;   // ISO timestamp of when the message was sent
  messageId?: string;  // Optional unique identifier for the message
}

/**
 * Rate limiting configuration to prevent spam
 */
const RATE_LIMIT_WINDOW = 60000;           // Window size in milliseconds (1 minute)
const MAX_MESSAGES_PER_WINDOW = 60;        // Maximum messages allowed per window
const messageCounters = new Map<string, {   // In-memory rate limit tracking
  count: number;                           // Current message count
  resetTime: number;                       // When the window resets
}>();

/**
 * Sanitizes message content to prevent malicious input
 * @param message - Raw message content from the client
 * @returns Sanitized message string
 */
function sanitizeMessage(message: string): string {
  return message.trim().slice(0, 1000); // Limit message length to 1000 characters
}

/**
 * GET handler for retrieving messages in a room
 * 
 * @param req - Next.js request object containing roomId in query params
 * @returns JSON response with sorted list of messages or error
 */
export async function GET(req: NextRequest) {
  try {
    // Extract roomId from query parameters
    const url = new URL(req.url);
    const roomId = url.searchParams.get('roomId');
    
    // Validate roomId presence
    if (!roomId) {
      return new NextResponse(JSON.stringify({ error: 'Missing roomId' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Retrieve all messages for the room from Redis
    // Messages are stored in a Redis hash with key pattern: room:{roomId}:messages
    const messages = await redis.hgetall(`room:${roomId}:messages`);
    const messageList = Object.values(messages || {}).map(msg => JSON.parse(msg));

    // Sort messages chronologically by timestamp
    messageList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return new NextResponse(JSON.stringify(messageList), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * POST handler for sending messages in a room
 * 
 * This handler manages the entire lifecycle of a message:
 * 1. Validates input and rate limits
 * 2. Sanitizes message content
 * 3. Stores in Redis with TTL
 * 4. Broadcasts via Pusher
 * 5. Schedules expiration
 * 
 * @param req - Next.js request object containing roomId, message, and userId
 * @returns JSON response with messageId or error
 */
export async function POST(req: NextRequest) {
  try {
    // Extract and validate required fields from request body
    const { roomId, message, userId } = await req.json();

    if (!roomId || !message || !userId) {
      return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Implement rate limiting using Redis
    // Key format: rate:{roomId}:{userId}
    const rateKey = `rate:${roomId}:${userId}`;
    const messageCount = await redis.incr(rateKey);
    
    // Set 60-second expiration window on first message
    if (messageCount === 1) {
      await redis.expire(rateKey, 60);
    }

    // Enforce rate limit of 10 messages per minute
    if (messageCount > 10) {
      return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Please wait a minute.' }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sanitize message content
    const sanitizedMessage = sanitizeMessage(message);
    if (!sanitizedMessage) {
      return new NextResponse(JSON.stringify({ error: 'Message cannot be empty' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create message object with unique ID using timestamp and random string
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const messageObject: Message = {
      messageId,
      userId,
      message: sanitizedMessage,
      timestamp: new Date().toISOString()
    };

    // Store message in Redis hash with 60-second TTL
    // Key format: room:{roomId}:messages
    await redis.hset(`room:${roomId}:messages`, {
      [messageId]: JSON.stringify(messageObject)
    });
    await redis.expire(`room:${roomId}:messages`, 60);

    // Prepare Pusher channel name with sanitized room ID
    const sanitizedRoomId = roomId.replace(/[^a-zA-Z0-9-_]/g, '');
    const channelName = `presence-room-${sanitizedRoomId}`;

    try {
      // Broadcast message to all clients in the room
      await pusherServer.trigger(
        channelName,
        'new-message',
        messageObject
      );

      // Schedule message expiration event after 60 seconds
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
    
    // Log detailed error information for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    
    // Handle Redis connection errors with specific status code
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
    
    // Handle Pusher WebSocket service errors
    if (error instanceof Error && error.message.includes('Pusher')) {
      return new NextResponse(JSON.stringify({ 
        error: 'Message service error',
        details: error.message
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generic error handler with detailed information
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