import { NextRequest, NextResponse } from "next/server";

import Ticket from "@/models/Ticket";

import { connectDB } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: any
) {
  try {
    await connectDB();

    const ticket =
      await Ticket.findById(
        params.id
      );

    return NextResponse.json(
      ticket.activities || []
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Timeline fetch failed",
      },
      { status: 500 }
    );
  }
}