import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Set a test key with a TTL of 60 seconds
    await redis.set("test-key", "Hello Redis", "EX", 60);
    // Retrieve the value from Redis
    const value = await redis.get("test-key");
    return NextResponse.json({ key: "test-key", value });
  } catch (error: any) {
    console.error("Redis test error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 