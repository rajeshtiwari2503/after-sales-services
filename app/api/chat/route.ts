import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import Chat from "@/models/Chat";

export async function POST(
  req: Request
) {
  try {
    await connectDB();

    const body =
      await req.json();

    const chat =
      await Chat.create({
        ticketId:
          body.ticketId,

        senderId:
          body.senderId,

        senderName:
          body.senderName,

        senderRole:
          body.senderRole,

        message:
          body.message,

        attachments:
          body.attachments ||
          [],
      });

    return NextResponse.json(
      {
        success: true,
        data: chat,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(
      "CHAT CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to send message",
      },
      { status: 500 }
    );
  }
}