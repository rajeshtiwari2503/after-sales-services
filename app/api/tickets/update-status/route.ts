import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const {
    ticketId,
    status,
    technicianId,
  } = body;

  const ticket = await Ticket.findByIdAndUpdate(
    ticketId,
    {
      status,
      technician: technicianId,
    },
    {
      new: true,
    }
  );

  return Response.json({
    success: true,
    message:
      "Ticket status updated successfully",
    data: ticket,
  });
}