 import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import Feedback from "@/models/Feedback";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { id } = await params;

    const feedback =
      await Feedback.findById(id);

    if (!feedback) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Feedback not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.log(
      "FEEDBACK GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch feedback",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { id } = await params;

    const body =
      await req.json();

    const updated =
      await Feedback.findByIdAndUpdate(
        id,
        body,
        {
          new: true,
        }
      );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.log(
      "FEEDBACK UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update feedback",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { id } = await params;

    await Feedback.findByIdAndDelete(
      id
    );

    return NextResponse.json({
      success: true,
      message:
        "Feedback deleted",
    });
  } catch (error) {
    console.log(
      "FEEDBACK DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete feedback",
      },
      { status: 500 }
    );
  }
}