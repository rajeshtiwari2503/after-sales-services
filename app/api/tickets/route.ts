import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";
import {
  successResponse,
  errorResponse,
} from "@/utils/apiResponse";

export async function GET() {
  try {
    await connectDB();

    const tickets = await Ticket.find()
      .populate("customer")
      .populate("technician")
      .sort({
        createdAt: -1,
      });

    return successResponse(tickets);
  } catch (error) {
    return errorResponse("Failed to fetch tickets");
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const ticket = await Ticket.create(body);

    return successResponse(
      ticket,
      "Ticket created successfully"
    );
  } catch (error) {
    return errorResponse("Failed to create ticket");
  }
}