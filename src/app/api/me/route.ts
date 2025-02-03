import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        verified: session.user.verified,
        verificationLevel: session.user.verificationLevel
      },
      session
    });
  } catch (error: any) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 