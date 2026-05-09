 import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Chat from "@/models/Chat";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    await connectDB();

    const { ticketId } = await params;

    const chats = await Chat.find({
      ticketId,
    }).sort({
      createdAt: 1,
    });

    return NextResponse.json({
      success: true,
      data: chats,
    });
  } catch (error) {
    console.log("CHAT FETCH ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch chats",
      },
      { status: 500 }
    );
  }
}