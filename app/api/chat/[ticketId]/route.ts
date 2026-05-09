import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import Chat from "@/models/Chat";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: {
      ticketId: string;
    };
  }
) {
  try {
    await connectDB();

    const chats =
      await Chat.find({
        ticketId:
          params.ticketId,
      }).sort({
        createdAt: 1,
      });

    return NextResponse.json({
      success: true,

      data: chats,
    });
  } catch (error: any) {
    console.log(
      "CHAT FETCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch chats",
      },
      { status: 500 }
    );
  }
}