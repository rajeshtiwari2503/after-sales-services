// import { NextRequest, NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Wallet from "@/models/Wallet";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// export async function POST(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     await connectDB();
//     const { amount, method } = await req.json(); // method: "bank" | "upi"

//     if (!amount || amount <= 0) {
//       return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
//     }

//     const ownerType =
//       session.user.role === "technician" ? "technician" : "service_center";

//     const wallet = await Wallet.findOne({
//       ownerId: session.user.id,
//       ownerType,
//     });

//     if (!wallet) {
//       return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
//     }

//     if (wallet.balance < amount) {
//       return NextResponse.json(
//         { error: "Insufficient balance" },
//         { status: 400 }
//       );
//     }

//     if (!wallet.bankDetails && !wallet.upiId) {
//       return NextResponse.json(
//         { error: "Please add bank details or UPI ID first" },
//         { status: 400 }
//       );
//     }

//     // Debit from wallet, move to pending
//     wallet.balance -= amount;
//     wallet.pendingAmount += amount;
//     wallet.transactions.push({
//       type: "withdrawal",
//       amount,
//       description: `Withdrawal request via ${method?.toUpperCase() || "bank"}`,
//       balanceAfter: wallet.balance,
//       createdAt: new Date(),
//     });

//     await wallet.save();

//     // TODO: trigger notification to super_admin to approve
//     return NextResponse.json({
//       success: true,
//       message: "Withdrawal request submitted. Will be processed in 2-3 business days.",
//       data: { balance: wallet.balance, pendingAmount: wallet.pendingAmount },
//     });
//   } catch (err) {
//     console.error("[WALLET WITHDRAW]", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Wallet from "@/models/Wallet";

import { getAuthUser } from "@/lib/auth-helper";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    const body = await req.json();

    const { amount, method } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return errorResponse("Invalid amount", 400);
    }

    const ownerType =
      user.role === "technician"
        ? "technician"
        : "service_center";

    const wallet = await Wallet.findOne({
      ownerId: user.userId,
      ownerType,
    });

    if (!wallet) {
      return errorResponse("Wallet not found", 404);
    }

    // Check balance
    if (wallet.balance < amount) {
      return errorResponse(
        "Insufficient balance",
        400
      );
    }

    // Check payment details
    if (!wallet.bankDetails && !wallet.upiId) {
      return errorResponse(
        "Please add bank details or UPI ID first",
        400
      );
    }

    // Debit wallet
    wallet.balance -= amount;

    // Add pending amount
    wallet.pendingAmount += amount;

    // Add transaction
    wallet.transactions.push({
      type: "withdrawal",
      amount,
      description: `Withdrawal request via ${
        method?.toUpperCase() || "BANK"
      }`,
      balanceAfter: wallet.balance,
      createdAt: new Date(),
    });

    await wallet.save();

    return successResponse(
      {
        balance: wallet.balance,
        pendingAmount: wallet.pendingAmount,
      },
      "Withdrawal request submitted successfully"
    );
  } catch (err) {
    console.error("[WALLET WITHDRAW]", err);

    return errorResponse("Server error", 500);
  }
}