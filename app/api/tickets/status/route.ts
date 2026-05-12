// import { NextResponse } from "next/server";

// import Ticket from "@/models/Ticket";

// import { connectDB } from "@/lib/db";

// export async function POST(
//     req: Request
// ) {
//     try {
//         await connectDB();

//         const {
//             ticketId,
//             status,
//         } = await req.json();

//         const ticket =
//             await Ticket.findById(
//                 ticketId
//             );

//         const oldStatus =
//             ticket.status;

//         ticket.status =
//             status;

//         ticket.timeline.push({
//             action: `Status changed to ${status}`,

//             performedBy:
//                 "Admin",
//         });

//         ticket.workflowLogs.push(
//             {
//                 action:
//                     "STATUS_CHANGED",

//                 oldValue:
//                     oldStatus,

//                 newValue:
//                     status,

//                 performedBy:
//                     "Admin",
//             }
//         );
//         if (
//             ticket.dueDate &&
//             new Date() >
//             new Date(
//                 ticket.dueDate
//             )
//         ) {
//             ticket.slaStatus =
//                 "BREACHED";

//             ticket.timeline.push({
//                 action:
//                     "SLA breached",

//                 performedBy:
//                     "System",
//             });
//         }
//         // Resolution tracking
//         if (
//             status ===
//             "RESOLVED"
//         ) {
//             ticket.resolvedAt =
//                 new Date();

//             ticket.resolutionTime =
//                 Math.floor(
//                     (new Date().getTime() -
//                         new Date(
//                             ticket.createdAt
//                         ).getTime()) /
//                     1000 /
//                     60
//                 );
//         }

//         await ticket.save();

//         return NextResponse.json({
//             success: true,
//         });
//     } catch (error) {
//         return NextResponse.json(
//             {
//                 success: false,
//             },
//             {
//                 status: 500,
//             }
//         );
//     }
// }
  
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
      status,
      performedBy,
      performedByName,
    } = await req.json();

    const ticket =
      await Ticket.findById(
        ticketId
      );

    // Ticket not found
    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ticket not found",
        },
        {
          status: 404,
        }
      );
    }

    const oldStatus =
      ticket.status;

    // Update status
    ticket.status =
      status;

    // Timeline entry
    ticket.timeline.push({
      action:
        "STATUS_CHANGED",

      description: `Status changed from ${oldStatus} to ${status}`,

      performedBy,

      performedByName,

      metadata: {
        oldStatus,
        newStatus:
          status,
      },

      createdAt:
        new Date(),
    } as any);

    // SLA Resolution Tracking
    if (
      status ===
      "resolved"
    ) {
      ticket.actualCompletionDate =
        new Date();

      // Calculate resolution time in minutes
      if (
        ticket.createdAt
      ) {
        const resolutionTime =
          Math.floor(
            (new Date().getTime() -
              new Date(
                ticket.createdAt
              ).getTime()) /
              1000 /
              60
          );

        if (
          ticket.sla
        ) {
          ticket.sla.resolutionTime =
            resolutionTime;

          // Check SLA breach
          if (
            ticket.sla
              .resolutionDeadline &&
            new Date() >
              new Date(
                ticket.sla.resolutionDeadline
              )
          ) {
            ticket.sla.isResolutionBreached =
              true;

            ticket.timeline.push({
              action:
                "SLA_BREACHED",

              description:
                "Resolution SLA breached",

              performedBy,

              performedByName:
                "System",

              metadata:
                {
                  type: "resolution",
                },

              createdAt:
                new Date(),
            } as any);
          }
        }
      }
    }

    await ticket.save();

    return NextResponse.json({
      success: true,
      message:
        "Ticket status updated successfully",
      ticket,
    });
  } catch (error: any) {
    console.error(
      "Ticket status update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error",
        error:
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}