// import {
//   NextRequest,
//   NextResponse,
// } from "next/server";

// import Warranty from "@/models/Warranty";

// import { connectDB } from "@/lib/db";

// export async function PUT(
//   req: NextRequest,
//   { params }: any
// ) {
//   await connectDB();

//   const body =
//     await req.json();

//   const updated =
//     await Warranty.findByIdAndUpdate(
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

//   await Warranty.findByIdAndDelete(
//     params.id
//   );

//   return NextResponse.json({
//     success: true,
//   });
// }

import { NextRequest, NextResponse } from "next/server";

import Warranty from "@/models/Warranty";

import { connectDB } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: any
) {
  await connectDB();

  const data =
    await Warranty.findById(
      params.id
    );

  return NextResponse.json(
    data
  );
}

export async function PUT(
  req: NextRequest,
  { params }: any
) {
  await connectDB();

  const body =
    await req.json();

  const updated =
    await Warranty.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );

  return NextResponse.json(
    updated
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  await connectDB();

  await Warranty.findByIdAndDelete(
    params.id
  );

  return NextResponse.json({
    success: true,
  });
}