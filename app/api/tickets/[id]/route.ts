import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import Ticket from "@/models/Ticket";

export async function GET(
  req: NextRequest,
  { params }: any
) {
  try {
    await connectDB();

    const ticket =
      await Ticket.findById(
        params.id
      )
        .populate(
          "assignedTo"
        )
        .populate(
          "customer"
        );

    return NextResponse.json(
      ticket
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Ticket not found",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  try {
    await connectDB();

    await Ticket.findByIdAndDelete(
      params.id
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Delete failed",
      },
      { status: 500 }
    );
  }
}