import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import Ticket from "@/models/Ticket";

export async function GET(
  req: NextRequest,
  { params }: any
) {
  await connectDB();

  const ticket =
    await Ticket.findById(
      params.id
    );

  return NextResponse.json(
    ticket.notes || []
  );
}

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

    ticket.notes.push({
      text: body.text,

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
          "Note add failed",
      },
      { status: 500 }
    );
  }
}