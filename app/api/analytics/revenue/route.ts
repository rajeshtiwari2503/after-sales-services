import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    monthlyRevenue:
      125000,

    yearlyRevenue:
      1500000,

    growth: "18%",
  });
}