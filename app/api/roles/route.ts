// import { NextRequest, NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Role, { DEFAULT_ROLES } from "@/models/Role";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// export async function GET(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "super_admin") {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     await connectDB();
//     const roles = await Role.find().sort({ isSystem: -1, name: 1 }).lean();

//     return NextResponse.json({ success: true, data: roles });
//   } catch (err) {
//     console.error("[ROLES GET]", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "super_admin") {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     await connectDB();
//     const body = await req.json();
//     const { name, displayName, description, permissions } = body;

//     if (!name || !displayName || !permissions?.length) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     const existing = await Role.findOne({ name: name.toLowerCase() });
//     if (existing) {
//       return NextResponse.json({ error: "Role already exists" }, { status: 409 });
//     }

//     const role = await Role.create({
//       name: name.toLowerCase(),
//       displayName,
//       description,
//       permissions,
//       isSystem: false,
//       createdBy: session.user.id,
//     });

//     return NextResponse.json({ success: true, data: role }, { status: 201 });
//   } catch (err) {
//     console.error("[ROLES POST]", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// // Seed default system roles (call once at setup)
// export async function PUT(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "super_admin") {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     await connectDB();

//     const results = await Promise.all(
//       DEFAULT_ROLES.map((role) =>
//         Role.findOneAndUpdate(
//           { name: role.name },
//           { $setOnInsert: role },
//           { upsert: true, new: true }
//         )
//       )
//     );

//     return NextResponse.json({
//       success: true,
//       message: `${results.length} roles seeded`,
//       data: results,
//     });
//   } catch (err) {
//     console.error("[ROLES SEED]", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";
import Role, { DEFAULT_ROLES } from "@/models/Role";

import { getAuthUser } from "@/lib/auth-helper";
import {
  successResponse,
  errorResponse,
} from "@/utils/apiResponse";

// ======================
// GET ALL ROLES
// ======================

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "super_admin") {
      return errorResponse("Forbidden", 403);
    }

    await connectDB();

    const roles = await Role.find()
      .sort({
        isSystem: -1,
        name: 1,
      })
      .lean();

    return successResponse(
      roles,
      "Roles fetched successfully"
    );
  } catch (err) {
    console.error("[ROLES GET]", err);

    return errorResponse("Server error", 500);
  }
}

// ======================
// CREATE ROLE
// ======================

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "super_admin") {
      return errorResponse("Forbidden", 403);
    }

    await connectDB();

    const body = await req.json();

    const {
      name,
      displayName,
      description,
      permissions,
    } = body;

    // Validation
    if (
      !name ||
      !displayName ||
      !permissions ||
      !Array.isArray(permissions) ||
      permissions.length === 0
    ) {
      return errorResponse(
        "Missing required fields",
        400
      );
    }

    // Check existing role
    const existing = await Role.findOne({
      name: name.toLowerCase(),
    });

    if (existing) {
      return errorResponse(
        "Role already exists",
        409
      );
    }

    // Create role
    const role = await Role.create({
      name: name.toLowerCase(),
      displayName,
      description,
      permissions,
      isSystem: false,
      createdBy: user.userId,
    });

    return successResponse(
      role,
      "Role created successfully",
      201
    );
  } catch (err) {
    console.error("[ROLES POST]", err);

    return errorResponse("Server error", 500);
  }
}

// ======================
// SEED DEFAULT ROLES
// ======================

export async function PUT(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "super_admin") {
      return errorResponse("Forbidden", 403);
    }

    await connectDB();

    const results = await Promise.all(
      DEFAULT_ROLES.map((role) =>
        Role.findOneAndUpdate(
          {
            name: role.name,
          },
          {
            $setOnInsert: role,
          },
          {
            upsert: true,
            new: true,
          }
        )
      )
    );

    return successResponse(
      results,
      `${results.length} roles seeded successfully`
    );
  } catch (err) {
    console.error("[ROLES SEED]", err);

    return errorResponse("Server error", 500);
  }
}