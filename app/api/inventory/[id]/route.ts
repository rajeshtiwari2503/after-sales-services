import {
  NextRequest,
  NextResponse,
} from "next/server";

import SparePart from "@/models/SparePart";

import { connectDB } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: any
) {
  await connectDB();

  const body =
    await req.json();

  const updated =
    await SparePart.findByIdAndUpdate(
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

  await SparePart.findByIdAndDelete(
    params.id
  );

  return NextResponse.json({
    success: true,
  });
}