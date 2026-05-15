import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wallet from "@/models/Wallet";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { amount, method } = await req.json(); // method: "bank" | "upi"

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const ownerType =
      session.user.role === "technician" ? "technician" : "service_center";

    const wallet = await Wallet.findOne({
      ownerId: session.user.id,
      ownerType,
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    if (!wallet.bankDetails && !wallet.upiId) {
      return NextResponse.json(
        { error: "Please add bank details or UPI ID first" },
        { status: 400 }
      );
    }

    // Debit from wallet, move to pending
    wallet.balance -= amount;
    wallet.pendingAmount += amount;
    wallet.transactions.push({
      type: "withdrawal",
      amount,
      description: `Withdrawal request via ${method?.toUpperCase() || "bank"}`,
      balanceAfter: wallet.balance,
      createdAt: new Date(),
    });

    await wallet.save();

    // TODO: trigger notification to super_admin to approve
    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted. Will be processed in 2-3 business days.",
      data: { balance: wallet.balance, pendingAmount: wallet.pendingAmount },
    });
  } catch (err) {
    console.error("[WALLET WITHDRAW]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}