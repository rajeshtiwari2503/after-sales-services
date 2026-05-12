import { connectDB } from "@/lib/db";
import Technician from "@/models/Technician";
 

export async function GET() {
  await connectDB();

  const data = await Technician.find().sort({
    createdAt: -1,
  });

  return Response.json({
    success: true,
    data,
  });
}

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const data = await Technician.create(body);

  return Response.json({
    success: true,
    message:
      "Technician created successfully",
    data,
  });
}