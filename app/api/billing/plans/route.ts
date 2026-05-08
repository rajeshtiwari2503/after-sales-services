import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      name: "FREE",
      price: 0,
    },

    {
      name: "PRO",
      price: 4999,
    },

    {
      name:
        "ENTERPRISE",
      price: 99999,
    },
  ]);
}