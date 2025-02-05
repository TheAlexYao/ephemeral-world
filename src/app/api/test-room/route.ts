/**
 * Test Room Route Handler
 * 
 * This module provides an endpoint for testing the room creation flow.
 * It verifies:
 * 1. Room creation endpoint functionality
 * 2. Database persistence
 * 3. Deep link generation
 * 
 * This is primarily used for:
 * - Integration testing
 * - Debugging room creation
 * - Verifying database connectivity
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatRooms } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// Force dynamic rendering to ensure fresh test results
export const dynamic = 'force-dynamic';

/**
 * GET handler for testing room creation flow
 * 
 * This handler performs an end-to-end test of room creation by:
 * 1. Creating a new room through the create-room endpoint
 * 2. Verifying the room was persisted in the database
 * 3. Validating the generated deep link
 * 
 * This endpoint is useful for:
 * - Integration testing
 * - Verifying room creation flow
 * - Debugging database issues
 * - Validating deep link format
 * 
 * @param req - Next.js request object
 * @returns JSON response with test results or error
 */
export async function GET(req: NextRequest) {
  try {
    // Step 1: Create a test room using the create-room endpoint
    // This tests the room creation API functionality
    const createResponse = await fetch(new URL('/api/create-room', req.url), {
      method: 'POST',
    });
    const { roomId, deepLink } = await createResponse.json();

    // Step 2: Verify room persistence in database
    // This tests database connectivity and write operations
    const room = await db.query.chatRooms.findFirst({
      where: eq(chatRooms.roomId, roomId),
    });

    // Step 3: Return comprehensive test results
    return NextResponse.json({
      success: true,
      test_results: {
        room_created: !!room,              // Verify room exists in DB
        room_data: room,                   // Full room data for inspection
        deep_link: deepLink,               // Generated deep link
        deep_link_valid: deepLink.includes(process.env.APP_ID!),  // Validate link format
      }
    });
  } catch (error: any) {
    // Log and return any errors encountered during testing
    console.error("Room test error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 