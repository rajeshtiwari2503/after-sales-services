import { connectDB } from "@/lib/db";
import ServiceCenter from "@/models/ServiceCenter";

export async function GET() {
  await connectDB();

  const data = await ServiceCenter.find().sort({
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

  const data = await ServiceCenter.create(body);

  return Response.json({
    success: true,
    message:
      "Service center created successfully",
    data,
  });
}