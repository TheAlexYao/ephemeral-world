/**
 * User Profile Route Handler
 * 
 * This module provides the current user's profile information including:
 * - Basic user details (id, name, email)
 * - WorldID verification status
 * - Current session data
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Force dynamic rendering to ensure fresh session data
export const dynamic = 'force-dynamic';

/**
 * GET handler for retrieving current user's profile
 * 
 * Returns the authenticated user's profile information including
 * their WorldID verification status. This endpoint is typically
 * used for:
 * - Initial app load to check auth status
 * - Profile page data
 * - Verification status checks
 * 
 * @param req - Next.js request object
 * @returns JSON response with user profile or error
 */
export async function GET(req: NextRequest) {
  try {
    // Get current session using NextAuth
    const session = await getServerSession(authOptions);
    
    // Verify user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Return normalized user profile with verification status
    return NextResponse.json({
      user: {
        id: session.user.id,                           // Unique user identifier
        name: session.user.name,                       // Display name
        email: session.user.email,                     // Email address
        verified: session.user.verified,               // WorldID verification status
        verificationLevel: session.user.verificationLevel  // WorldID verification level
      },
      session  // Include full session for debugging
    });
  } catch (error: any) {
    // Log and return session errors
    console.error("Session error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 