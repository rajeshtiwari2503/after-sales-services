// app/api/tickets/stats/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const technicianId = searchParams.get("technicianId");
    const customerId = searchParams.get("customerId");
    const brandId = searchParams.get("brandId");
    const serviceCenterId = searchParams.get("serviceCenterId");

    const filter: any = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (technicianId) filter.technicianId = technicianId;
    if (customerId) filter.customerId = customerId;
    if (brandId) filter.brandId = brandId;
    if (serviceCenterId) filter.serviceCenterId = serviceCenterId;

    // Total Tickets
    const totalTickets = await Ticket.countDocuments(filter);

    // Status Counts
    const openTickets = await Ticket.countDocuments({
      ...filter,
      status: "OPEN",
    });

    const inProgressTickets = await Ticket.countDocuments({
      ...filter,
      status: "IN_PROGRESS",
    });

    const resolvedTickets = await Ticket.countDocuments({
      ...filter,
      status: "RESOLVED",
    });

    const closedTickets = await Ticket.countDocuments({
      ...filter,
      status: "CLOSED",
    });

    const pendingTickets = await Ticket.countDocuments({
      ...filter,
      status: "PENDING",
    });

    // Priority Counts
    const lowPriority = await Ticket.countDocuments({
      ...filter,
      priority: "LOW",
    });

    const mediumPriority = await Ticket.countDocuments({
      ...filter,
      priority: "MEDIUM",
    });

    const highPriority = await Ticket.countDocuments({
      ...filter,
      priority: "HIGH",
    });

    const urgentPriority = await Ticket.countDocuments({
      ...filter,
      priority: "URGENT",
    });

    // Recent Tickets
    const recentTickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customerId")
      .populate("technicianId")
      .populate("brandId")
      .populate("serviceCenterId");

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalTickets,

          status: {
            open: openTickets,
            inProgress: inProgressTickets,
            resolved: resolvedTickets,
            closed: closedTickets,
            pending: pendingTickets,
          },

          priority: {
            low: lowPriority,
            medium: mediumPriority,
            high: highPriority,
            urgent: urgentPriority,
          },
        },

        recentTickets,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Ticket Stats API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch ticket statistics",
        error: error.message,
      },
      { status: 500 }
    );
  }
}