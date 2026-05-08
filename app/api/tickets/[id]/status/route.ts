import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import Ticket from "@/models/Ticket";

export async function PUT(
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

    ticket.status =
      body.status;

    ticket.activities.push({
      action: `Status changed to ${body.status}`,

      createdAt:
        new Date(),
    });

    await ticket.save();

    return NextResponse.json(
      ticket
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Status update failed",
      },
      { status: 500 }
    );
  }
}