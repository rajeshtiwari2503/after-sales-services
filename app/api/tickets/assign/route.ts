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
      technician,
    } = await req.json();

    const ticket =
      await Ticket.findByIdAndUpdate(
        ticketId,
        {
          assignedTechnician:
            technician,

          status:
            "ASSIGNED",

          $push: {
            timeline: {
              action: `Assigned to ${technician}`,

              performedBy:
                "Admin",
            },
          },
        },
        {
          new: true,
        }
      );

    return NextResponse.json({
      success: true,
      ticket,
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