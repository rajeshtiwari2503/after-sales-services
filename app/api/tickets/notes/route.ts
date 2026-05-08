import { NextResponse } from "next/server";

import Ticket from "@/models/Ticket";

import { connectDB } from "@/lib/db";

export async function POST(
  req: Request
) {
  try {
    await connectDB();

    const {
      ticketId,
      note,
    } = await req.json();

    await Ticket.findByIdAndUpdate(
      ticketId,
      {
        $push: {
          internalNotes: {
            note,

            createdBy:
              "Admin",
          },

          timeline: {
            action:
              "Internal note added",

            performedBy:
              "Admin",
          },
        },
      }
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}