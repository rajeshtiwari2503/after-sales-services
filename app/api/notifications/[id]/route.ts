import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import Notification from "@/models/Notification";

export async function GET(
  req: Request
) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(req.url);

    const userId =
      searchParams.get(
        "userId"
      );

    const notifications =
      await Notification.find(
        userId
          ? { userId }
          : {}
      ).sort({
        createdAt: -1,
      });

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    console.log(
      "NOTIFICATION FETCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch notifications",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request
) {
  try {
    await connectDB();

    const body =
      await req.json();

    const notification =
      await Notification.create({
        userId:
          body.userId,

        title:
          body.title,

        message:
          body.message,

        type:
          body.type,

        link:
          body.link ?? body.actionUrl ?? null,

        metadata:
          body.metadata,
      });

    return NextResponse.json(
      {
        success: true,
        data: notification,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(
      "NOTIFICATION CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create notification",
      },
      { status: 500 }
    );
  }
}