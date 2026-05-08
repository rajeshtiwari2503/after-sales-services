import { NextResponse } from "next/server";

import Ticket from "@/models/Ticket";

import { connectDB } from "@/lib/db";

export async function GET() {
  await connectDB();

  const breached =
    await Ticket.countDocuments({
      slaStatus:
        "BREACHED",
    });

  const active =
    await Ticket.countDocuments({
      slaStatus:
        "ACTIVE",
    });

  return NextResponse.json({
    breached,

    active,
  });
}