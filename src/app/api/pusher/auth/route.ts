import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await req.formData();
    const socketId = data.get("socket_id") as string;
    const channel = data.get("channel_name") as string;

    if (!socketId || !channel) {
      return new NextResponse(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // For presence channels, we need to provide user info
    const presenceData = {
      user_id: session.user.id,
      user_info: {
        name: session.user.name || "Anonymous",
        email: session.user.email,
      },
    };

    // Generate auth signature
    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channel,
      presenceData
    );

    return new NextResponse(JSON.stringify(authResponse), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
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
