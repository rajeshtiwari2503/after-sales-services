 import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse("Unauthorized", 401);

    await connectDB();

    // Try Technician model first, fallback to Users with technician role
    let technicians: any[] = [];
    try {
      const Technician = mongoose.models.Technician;
      if (Technician) {
        technicians = await Technician
          .find({ tenantId: user.tenantId })
          .populate("userId", "name email phone")
          .lean();
      }
    } catch {}

    if (!technicians.length) {
      // Fallback: get users with technician role
      const User = mongoose.models.User;
      const techUsers = await User
        .find({ tenantId: user.tenantId, role: "technician" })
        .select("name email phone isActive createdAt")
        .lean();
      technicians = techUsers.map((u: any) => ({
        _id: u._id, userId: u,
        employeeId: `EMP-${u._id.toString().slice(-4).toUpperCase()}`,
        specializations: [],
        rating: 4.5,
        totalTickets: 0,
        completedTickets: 0,
        availability: { isAvailable: u.isActive },
        isActive: u.isActive,
      }));
    }

    return successResponse(technicians, "Technicians fetched");
  } catch (error) {
    console.error("Technicians error:", error);
    return errorResponse("An error occurred", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse("Unauthorized", 401);

    await connectDB();
    const body = await request.json();

    // Create user with technician role first
    const { hashPassword } = await import("@/lib/hash");
    const { signToken } = await import("@/lib/jwt");
    const User = mongoose.models.User;

    const existing = await User.findOne({ email: body.email, tenantId: user.tenantId });
    if (existing) return errorResponse("Email already registered", 400);

    const hashedPassword = await hashPassword("TechPass123!");
    const newUser = await User.create({
      name: body.name, email: body.email,
      password: hashedPassword, role: "technician",
      tenantId: user.tenantId, phone: body.phone,
    });

    // Try to create Technician record
    try {
      const Technician = mongoose.models.Technician;
      if (Technician) {
        const tech = await Technician.create({
          userId: newUser._id,
          serviceCenterId: body.serviceCenterId,
          employeeId: body.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
          specializations: body.specializations ?? [],
          tenantId: user.tenantId,
        });
        return successResponse(tech, "Technician created", 201);
      }
    } catch {}

    return successResponse(
      { userId: newUser._id, name: newUser.name, email: newUser.email },
      "Technician created",
      201
    );
  } catch (error) {
    console.error("Create technician error:", error);
    return errorResponse("An error occurred", 500);
  }
}