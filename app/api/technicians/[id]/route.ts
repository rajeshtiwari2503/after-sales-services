import {
  NextRequest,
  NextResponse,
} from "next/server";

import Technician from "@/models/Technician";

import { connectDB } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  {
    params,
  }: any
) {
  try {
    await connectDB();

    const body =
      await req.json();

    const technician =
      await Technician.findByIdAndUpdate(
        params.id,
        body,
        {
          new: true,
        }
      );

    return NextResponse.json(
      technician
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: any
) {
  try {
    await connectDB();

    await Technician.findByIdAndDelete(
      params.id
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}