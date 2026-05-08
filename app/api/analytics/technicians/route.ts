import { NextResponse } from "next/server";

import User from "@/models/User";

import Ticket from "@/models/Ticket";

import { connectDB } from "@/lib/db";

export async function GET() {
  await connectDB();

  const technicians =
    await User.find({
      role: "TECHNICIAN",
    });

  const stats =
    await Promise.all(
      technicians.map(
        async (tech) => {
          const completed =
            await Ticket.countDocuments(
              {
                assignedTo:
                  tech._id,

                status:
                  "RESOLVED",
              }
            );

          return {
            technician:
              tech.name,

            completed,
          };
        }
      )
    );

  return NextResponse.json(
    stats
  );
}