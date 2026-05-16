// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
 
 

// export async function GET() {
//   await connectDB();

//   const data = await User.find().sort({
//     createdAt: -1,
//   });

//   return Response.json({
//     success: true,
//     data,
//   });
// }

// export async function POST(req: Request) {
//   await connectDB();

//   const body = await req.json();

//   const data = await User.create(body);

//   return Response.json({
//     success: true,
//     message:
//       "Technician created successfully",
//     data,
//   });
// }

import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import User from "@/models/User";

import {
  successResponse,
  errorResponse,
} from "@/utils/apiResponse";

import { getAuthUser } from "@/lib/auth-helper";

export async function GET(
  request: NextRequest
) {
  try {
    const authUser =
      getAuthUser(request);

    if (!authUser) {
      return errorResponse(
        "Unauthorized",
        401
      );
    }

    await connectDB();

    const technicians =
      await User.find({
        role: "technician",
        tenantId:
          authUser.tenantId,
      })
        .sort({
          createdAt: -1,
        })
        .select("-password")
        .lean();

    return successResponse(
      technicians,
      "Technicians fetched successfully"
    );
  } catch (error) {
    console.error(
      "Technicians GET error:",
      error
    );

    return errorResponse(
      "Internal server error",
      500
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const authUser =
      getAuthUser(request);

    if (!authUser) {
      return errorResponse(
        "Unauthorized",
        401
      );
    }

    await connectDB();

    const body =
      await request.json();

    const technician =
      await User.create({
        ...body,
        role: "technician",
        tenantId:
          authUser.tenantId,
      });

    return successResponse(
      technician,
      "Technician created successfully",
      201
    );
  } catch (error) {
    console.error(
      "Technician POST error:",
      error
    );

    return errorResponse(
      "Internal server error",
      500
    );
  }
}