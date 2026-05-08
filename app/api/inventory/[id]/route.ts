// import {
//   NextRequest,
//   NextResponse,
// } from "next/server";

// import SparePart from "@/models/SparePart";

// import { connectDB } from "@/lib/db";

// export async function PUT(
//   req: NextRequest,
//   { params }: any
// ) {
//   await connectDB();

//   const body =
//     await req.json();

//   const updated =
//     await SparePart.findByIdAndUpdate(
//       params.id,
//       body,
//       {
//         new: true,
//       }
//     );

//   return NextResponse.json(
//     updated
//   );
// }

// export async function DELETE(
//   req: NextRequest,
//   { params }: any
// ) {
//   await connectDB();

//   await SparePart.findByIdAndDelete(
//     params.id
//   );

//   return NextResponse.json({
//     success: true,
//   });
// }

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