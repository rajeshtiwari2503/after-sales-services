import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import Inventory from "@/models/Inventory";

export async function GET() {
  try {
    await connectDB();

    const items =
      await Inventory.find().sort({
        createdAt: -1,
      });

    return NextResponse.json(
      items
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Failed to fetch inventory",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest
) {
  try {
    await connectDB();

    const body =
      await req.json();

    const item =
      await Inventory.create(
        body
      );

    return NextResponse.json(
      item
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Failed to create inventory",
      },
      { status: 500 }
    );
  }
}