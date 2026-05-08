import { NextRequest, NextResponse } from "next/server";

import Warranty from "@/models/Warranty";

import { connectDB } from "@/lib/db";

export async function GET() {
  await connectDB();

  const data =
    await Warranty.find().sort({
      createdAt: -1,
    });

  return NextResponse.json(
    data
  );
}

export async function POST(
  req: NextRequest
) {
  await connectDB();

  const body =
    await req.json();

  const warranty =
    await Warranty.create(
      body
    );

  return NextResponse.json(
    warranty
  );
}