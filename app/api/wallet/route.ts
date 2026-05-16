import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wallet from "@/models/Wallet";

import { successResponse, errorResponse, paginatedResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    await connectDB();

    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId") || user.userId;
    const ownerType = searchParams.get("ownerType") ||
      (user.role === "technician" ? "technician" : "service_center");

    // Only super_admin can query other wallets
    if (ownerId !== user.userId && user.role !== "super_admin") {
      return errorResponse('Forbidden', 403);
    }

    const wallet = await Wallet.findOne({ ownerId, ownerType });
    if (!wallet) {
      // Auto-create wallet on first access
      const newWallet = await Wallet.create({ ownerId, ownerType });
      return NextResponse.json({ success: true, data: newWallet });
    }

    // Pagination for transactions
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const transactions = wallet.transactions
      .sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      )
      .slice(skip, skip + limit);

    return successResponse({
      success: true,
      data: {
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        totalWithdrawn: wallet.totalWithdrawn,
        pendingAmount: wallet.pendingAmount,
        bankDetails: wallet.bankDetails,
        upiId: wallet.upiId,
        transactions,
        totalTransactions: wallet.transactions.length,
        page,
        totalPages: Math.ceil(wallet.transactions.length / limit),
      },
    });
  } catch (err) {
    console.error("[WALLET GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    await connectDB();
    const body = await req.json();
    const { bankDetails, upiId } = body;

    const wallet = await Wallet.findOneAndUpdate(
      { ownerId: user.userId },
      { bankDetails, upiId },
      { new: true, upsert: true }
    );

    return successResponse({ success: true, data: wallet });
  } catch (err) {
    console.error("[WALLET PATCH]", err);
    return errorResponse('Server error', 500);
  }
}