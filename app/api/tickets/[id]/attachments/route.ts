import { NextRequest, NextResponse } from "next/server";

import Ticket from "@/models/Ticket";

import { connectDB } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: any
) {
  try {
    await connectDB();

    const body =
      await req.json();

    const ticket =
      await Ticket.findById(
        params.id
      );

    ticket.attachments.push({
      name: body.name,

      url: body.url,

      createdAt:
        new Date(),
    });

    await ticket.save();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Attachment upload failed",
      },
      { status: 500 }
    );
  }
}