// app/api/wallet/admin/route.ts  — NEW FILE
// Admin: list all wallets, approve/reject withdrawals, set ticketRate per wallet

import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import connectDB from '@/lib/db';
import Wallet from '@/models/Wallet';
import mongoose from 'mongoose';

/* ── GET /api/wallet/admin — all wallets overview ── */
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);
    if (user.role !== 'admin') return errorResponse('Forbidden', 403);

    await connectDB();
    const { searchParams } = new URL(req.url);
    const ownerType = searchParams.get('ownerType') ?? '';
    const tenantId  = searchParams.get('tenantId')  ?? '';

    const filter: Record<string, any> = {};
    if (ownerType) filter.ownerType = ownerType;
    if (tenantId)  filter.tenantId  = tenantId;

    const wallets = await Wallet.find(filter)
      .sort({ totalEarned: -1 })
      .lean();

    const summary = {
      totalWallets:      wallets.length,
      totalBalance:      wallets.reduce((s: number, w: any) => s + w.balance, 0),
      totalEarned:       wallets.reduce((s: number, w: any) => s + w.totalEarned, 0),
      totalWithdrawn:    wallets.reduce((s: number, w: any) => s + w.totalWithdrawn, 0),
      pendingWithdrawals:wallets.reduce((s: number, w: any) =>
        s + (w.withdrawalRequests ?? []).filter((r: any) => r.status === 'pending').length, 0),
      pendingAmount:     wallets.reduce((s: number, w: any) => s + (w.pendingAmount ?? 0), 0),
    };

    return successResponse({ wallets, summary }, 'Wallets fetched');
  } catch (err) {
    console.error('[WALLET ADMIN GET]', err);
    return errorResponse('Server error', 500);
  }
}

/* ── PATCH /api/wallet/admin — approve/reject withdrawal OR set ticketRate ── */
export async function PATCH(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);
    if (user.role !== 'admin') return errorResponse('Forbidden', 403);

    await connectDB();
    const body = await req.json();
    const { action, walletId, requestId, reason, ticketRate } = body;

    /* ── Set ticket rate ── */
    if (action === 'set_rate') {
      if (!walletId || ticketRate === undefined)
        return errorResponse('walletId and ticketRate required', 400);

      const wallet = await Wallet.findByIdAndUpdate(
        walletId,
        { ticketRate: Number(ticketRate) },
        { new: true }
      );
      if (!wallet) return errorResponse('Wallet not found', 404);
      return successResponse({ ticketRate: wallet.ticketRate }, 'Ticket rate updated');
    }

    /* ── Approve withdrawal ── */
    if (action === 'approve') {
      if (!walletId || !requestId) return errorResponse('walletId and requestId required', 400);

      const wallet = await Wallet.findById(walletId);
      if (!wallet) return errorResponse('Wallet not found', 404);

      const req_ = wallet.withdrawalRequests.id(requestId);
      if (!req_) return errorResponse('Withdrawal request not found', 404);
      if (req_.status !== 'pending') return errorResponse('Request already processed', 400);

      req_.status      = 'approved';
      req_.processedAt = new Date();
      req_.processedBy = new mongoose.Types.ObjectId(user.userId);

      wallet.totalWithdrawn += req_.amount;
      wallet.pendingAmount  -= req_.amount;

      wallet.transactions.push({
        type:         'debit',
        amount:       req_.amount,
        description:  `Withdrawal approved — ${req_.method.toUpperCase()}`,
        referenceId:  requestId,
        balanceAfter: wallet.balance,
        performedBy:  new mongoose.Types.ObjectId(user.userId),
        createdAt:    new Date(),
      });

      await wallet.save();
      return successResponse({ totalWithdrawn: wallet.totalWithdrawn }, 'Withdrawal approved');
    }

    /* ── Reject withdrawal ── */
    if (action === 'reject') {
      if (!walletId || !requestId) return errorResponse('walletId and requestId required', 400);

      const wallet = await Wallet.findById(walletId);
      if (!wallet) return errorResponse('Wallet not found', 404);

      const req_ = wallet.withdrawalRequests.id(requestId);
      if (!req_) return errorResponse('Withdrawal request not found', 404);
      if (req_.status !== 'pending') return errorResponse('Request already processed', 400);

      req_.status          = 'rejected';
      req_.processedAt     = new Date();
      req_.processedBy     = new mongoose.Types.ObjectId(user.userId);
      req_.rejectionReason = reason ?? 'Rejected by admin';

      // Refund to balance
      wallet.balance       += req_.amount;
      wallet.pendingAmount -= req_.amount;

      wallet.transactions.push({
        type:         'refund',
        amount:       req_.amount,
        description:  `Withdrawal rejected — refunded to balance`,
        referenceId:  requestId,
        balanceAfter: wallet.balance,
        performedBy:  new mongoose.Types.ObjectId(user.userId),
        createdAt:    new Date(),
      });

      await wallet.save();
      return successResponse({ balance: wallet.balance }, 'Withdrawal rejected, amount refunded');
    }

    return errorResponse('Invalid action', 400);
  } catch (err) {
    console.error('[WALLET ADMIN PATCH]', err);
    return errorResponse('Server error', 500);
  }
}