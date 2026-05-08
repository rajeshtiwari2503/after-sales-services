import { NextResponse } from "next/server";

import Ticket from "@/models/Ticket";

import { connectDB } from "@/lib/db";

export async function GET() {
  await connectDB();

  const data =
    await Ticket.aggregate([
      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },
        },
      },
    ]);

  return NextResponse.json(
    data
  );
}