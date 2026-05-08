import { NextResponse } from "next/server";

import Invoice from "@/models/Invoice";

import { connectDB } from "@/lib/db";

export async function GET() {
  await connectDB();

  const invoices =
    await Invoice.find();

  return NextResponse.json(
    invoices
  );
}