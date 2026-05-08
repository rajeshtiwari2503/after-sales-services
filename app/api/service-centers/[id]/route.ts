import {
  NextRequest,
  NextResponse,
} from "next/server";

import ServiceCenter from "@/models/ServiceCenter";

import { connectDB } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: any
) {
  await connectDB();

  const body =
    await req.json();

  const updated =
    await ServiceCenter.findByIdAndUpdate(
      params.id,
      body,
      {
        new: true,
      }
    );

  return NextResponse.json(
    updated
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  await connectDB();

  await ServiceCenter.findByIdAndDelete(
    params.id
  );

  return NextResponse.json({
    success: true,
  });
}