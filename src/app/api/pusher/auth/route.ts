/**
 * Pusher Authentication Route Handler
 * 
 * This module handles WebSocket authentication for Pusher presence channels.
 * It ensures that:
 * - Users are authenticated via WorldID
 * - Proper socket and channel information is provided
 * - User presence data is attached to the connection
 * - Secure auth signatures are generated
 */

import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST handler for authenticating Pusher WebSocket connections
 * 
 * This handler performs the following steps:
 * 1. Verifies user authentication
 * 2. Validates socket and channel parameters
 * 3. Attaches user presence data
 * 4. Generates secure auth signature
 * 
 * @param req - Next.js request object containing socket_id and channel_name
 * @returns JSON response with auth signature or error
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated with WorldID
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract socket and channel information from form data
    const data = await req.formData();
    const socketId = data.get("socket_id") as string;
    const channel = data.get("channel_name") as string;

    // Validate required parameters
    if (!socketId || !channel) {
      return new NextResponse(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create presence data object for real-time user tracking
    // This data will be available to all clients in the channel
    const presenceData = {
      user_id: session.user.id,
      user_info: {
        name: session.user.name || "Anonymous",
        email: session.user.email,
      },
    };

    // Generate secure auth signature using Pusher's SDK
    // This authenticates the socket connection for the specific channel
    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channel,
      presenceData
    );

    // Return the auth signature to the client
    return new NextResponse(JSON.stringify(authResponse), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log and return appropriate error response
    console.error("Error in Pusher auth:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
