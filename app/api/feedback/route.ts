import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import Feedback from "@/models/Feedback";

export async function GET() {
  try {
    await connectDB();

    const feedbacks =
      await Feedback.find()
        .sort({
          createdAt: -1,
        });

    return NextResponse.json({
      success: true,
      data: feedbacks,
    });
  } catch (error: any) {
    console.log(
      "FEEDBACK FETCH ERROR:",
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

export async function POST(
  req: Request
) {
  try {
    await connectDB();

    const body =
      await req.json();

    const feedback =
      await Feedback.create({
        ticketId:
          body.ticketId,

        customerId:
          body.customerId,

        customerName:
          body.customerName,

        rating:
          body.rating,

        serviceQuality:
          body.serviceQuality,

        technicianBehavior:
          body.technicianBehavior,

        responseTime:
          body.responseTime,

        recommendationLikelihood:
          body.recommendationLikelihood,

        feedbackMessage:
          body.feedbackMessage,

        suggestions:
          body.suggestions,
      });

    return NextResponse.json(
      {
        success: true,
        data: feedback,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(
      "FEEDBACK CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to submit feedback",
      },
      { status: 500 }
    );
  }
}