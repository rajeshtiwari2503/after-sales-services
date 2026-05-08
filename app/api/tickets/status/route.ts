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
        } = await req.json();

        const ticket =
            await Ticket.findById(
                ticketId
            );

        const oldStatus =
            ticket.status;

        ticket.status =
            status;

        ticket.timeline.push({
            action: `Status changed to ${status}`,

            performedBy:
                "Admin",
        });

        ticket.workflowLogs.push(
            {
                action:
                    "STATUS_CHANGED",

                oldValue:
                    oldStatus,

                newValue:
                    status,

                performedBy:
                    "Admin",
            }
        );
        if (
            ticket.dueDate &&
            new Date() >
            new Date(
                ticket.dueDate
            )
        ) {
            ticket.slaStatus =
                "BREACHED";

            ticket.timeline.push({
                action:
                    "SLA breached",

                performedBy:
                    "System",
            });
        }
        // Resolution tracking
        if (
            status ===
            "RESOLVED"
        ) {
            ticket.resolvedAt =
                new Date();

            ticket.resolutionTime =
                Math.floor(
                    (new Date().getTime() -
                        new Date(
                            ticket.createdAt
                        ).getTime()) /
                    1000 /
                    60
                );
        }

        await ticket.save();

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

