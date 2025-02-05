/**
 * Redis Test Route Handler
 * 
 * This module provides a simple endpoint to test Redis connectivity
 * and basic operations. It verifies:
 * 1. Redis connection is working
 * 2. Key-value operations are functional
 * 3. TTL functionality is working
 */

import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

// Use Node.js runtime for Redis client support
export const runtime = 'nodejs';

/**
 * GET handler for testing Redis functionality
 * 
 * This handler performs a simple Redis test by:
 * 1. Setting a test key with a 60-second TTL
 * 2. Retrieving the key's value
 * 3. Returning both key and value in response
 * 
 * This endpoint is useful for:
 * - Verifying Redis connectivity
 * - Testing TTL functionality
 * - Debugging Redis configuration
 * 
 * @param req - Next.js request object
 * @returns JSON response with test results or error
 */
export async function GET(req: NextRequest) {
  try {
    // Set a test key with a 60-second TTL
    // This tests both write operations and TTL functionality
    await redis.set("test-key", "Hello Redis", "EX", 60);

    // Retrieve the value to test read operations
    const value = await redis.get("test-key");

    // Return successful test results
    return NextResponse.json({ key: "test-key", value });
  } catch (error: any) {
    // Log and return any Redis errors
    console.error("Redis test error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 