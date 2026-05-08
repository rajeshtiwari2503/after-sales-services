import { NextResponse } from "next/server";

import Subscription from "@/models/Subscription";

import { connectDB } from "@/lib/db";

export async function GET() {
  await connectDB();

  const subscriptions =
    await Subscription.find();

  return NextResponse.json(
    subscriptions
  );
}