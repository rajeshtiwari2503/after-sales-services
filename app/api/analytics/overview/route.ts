// import { NextResponse } from "next/server";

// import Ticket from "@/models/Ticket";

// import { connectDB } from "@/lib/db";

// export async function GET() {
//   await connectDB();

//   const totalTickets =
//     await Ticket.countDocuments();

//   const resolvedTickets =
//     await Ticket.countDocuments({
//       status: "RESOLVED",
//     });

//   const openTickets =
//     await Ticket.countDocuments({
//       status: "OPEN",
//     });

//   const breached =
//     await Ticket.countDocuments({
//       slaStatus:
//         "BREACHED",
//     });

//   return NextResponse.json({
//     totalTickets,
//     resolvedTickets,
//     openTickets,
//     breached,
//   });
// }


import { NextResponse } from "next/server";

import Ticket from "@/models/Ticket";

import { connectDB } from "@/lib/db";

export async function GET() {
  await connectDB();

  const totalTickets =
    await Ticket.countDocuments();

  const resolvedTickets =
    await Ticket.countDocuments({
      status: "RESOLVED",
    });

  const openTickets =
    await Ticket.countDocuments({
      status: "OPEN",
    });

  const breached =
    await Ticket.countDocuments({
      slaStatus: "BREACHED",
    });

  return NextResponse.json({
    totalTickets,
    resolvedTickets,
    openTickets,
    breached,
  });
}