import { connectDB } from "@/lib/db";
import TechnicianLocation from "@/models/TechnicianLocation";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const data =
    await TechnicianLocation.create(body);

  return Response.json({
    success: true,
    data,
  });
}