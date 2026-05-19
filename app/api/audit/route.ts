// import { NextRequest, NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import AuditLog from "@/models/AuditLog";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// export async function GET(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "super_admin") {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     await connectDB();
//     const { searchParams } = new URL(req.url);

//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "50");
//     const skip = (page - 1) * limit;

//     const filter: Record<string, unknown> = {};
//     const userId = searchParams.get("userId");
//     const module = searchParams.get("module");
//     const action = searchParams.get("action");
//     const status = searchParams.get("status");
//     const from = searchParams.get("from");
//     const to = searchParams.get("to");

//     if (userId) filter.userId = userId;
//     if (module) filter.module = module;
//     if (action) filter.action = new RegExp(action, "i");
//     if (status) filter.status = status;
//     if (from || to) {
//       filter.createdAt = {};
//       if (from) (filter.createdAt as Record<string, unknown>).$gte = new Date(from);
//       if (to) (filter.createdAt as Record<string, unknown>).$lte = new Date(to);
//     }

//     const [logs, total] = await Promise.all([
//       AuditLog.find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       AuditLog.countDocuments(filter),
//     ]);

//     return NextResponse.json({
//       success: true,
//       data: logs,
//       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
//     });
//   } catch (err) {
//     console.error("[AUDIT GET]", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// // Called internally by auditMiddleware helper
// export async function POST(req: NextRequest) {
//   try {
//     await connectDB();
//     const body = await req.json();

//     const log = await AuditLog.create({
//       ...body,
//       ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
//       userAgent: req.headers.get("user-agent") || "unknown",
//     });

//     return NextResponse.json({ success: true, data: log }, { status: 201 });
//   } catch (err) {
//     console.error("[AUDIT POST]", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }
 
import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";

import { getAuthUser } from "@/lib/auth-helper";

import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "@/utils/apiResponse";

// ======================
// GET AUDIT LOGS
// ======================

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user || user.role !== "super_admin") {
      return errorResponse("Forbidden", 403);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);

    // ======================
    // Pagination
    // ======================

    const page = Number(searchParams.get("page") || 1);

    const limit = Number(searchParams.get("limit") || 50);

    const skip = (page - 1) * limit;

    // ======================
    // Filters
    // ======================

    const filter: Record<string, any> = {};

    const userId = searchParams.get("userId");
    const moduleName = searchParams.get("module");
    const action = searchParams.get("action");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (userId) {
      filter.userId = userId;
    }

    if (moduleName) {
      filter.module = moduleName;
    }

    if (action) {
      filter.action = {
        $regex: action,
        $options: "i",
      };
    }

    if (status) {
      filter.status = status;
    }

    // ======================
    // Date Range
    // ======================

    if (from || to) {
      filter.createdAt = {};

      if (from) {
        filter.createdAt.$gte = new Date(from);
      }

      if (to) {
        filter.createdAt.$lte = new Date(to);
      }
    }

    // ======================
    // Fetch Logs
    // ======================

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      AuditLog.countDocuments(filter),
    ]);

    return paginatedResponse(
      logs,
      {
        page,
        limit,
        total,
        // totalPages: Math.ceil(total / limit),
      },
      "Audit logs fetched successfully"
    );
  } catch (error) {
    console.error("[AUDIT_LOG_GET_ERROR]", error);

    return errorResponse("Internal Server Error", 500);
  }
}

// ======================
// CREATE AUDIT LOG
// ======================

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const forwardedFor = request.headers.get("x-forwarded-for");

    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const userAgent =
      request.headers.get("user-agent") || "unknown";

    const log = await AuditLog.create({
      ...body,
      ipAddress,
      userAgent,
    });

    return successResponse(
      log,
      "Audit log created successfully",
      201
    );
  } catch (error) {
    console.error("[AUDIT_LOG_POST_ERROR]", error);

    return errorResponse("Internal Server Error", 500);
  }
}