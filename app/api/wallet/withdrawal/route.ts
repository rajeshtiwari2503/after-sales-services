// app/api/wallet/withdrawal/route.ts  — REPLACE existing withdrawal.ts
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import connectDB from '@/lib/db';
import Wallet from '@/models/Wallet';
import mongoose from 'mongoose';

/* ── POST /api/wallet/withdrawal — request withdrawal ── */
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['service_center','manager'].includes(user.role))
      return errorResponse('Forbidden', 403);

    await connectDB();
    const body = await req.json();
    const { amount, method } = body;   // method: 'bank' | 'upi'

    if (!amount || amount < 100)
      return errorResponse('Minimum withdrawal amount is ₹100', 400);
    if (!['bank','upi'].includes(method))
      return errorResponse('Method must be bank or upi', 400);

    const ownerType: 'service_center' | 'brand' =
      user.role === 'manager' ? 'brand' : 'service_center';
    const scId    = req.headers.get('x-service-center-id');
    const ownerId = (user.role === 'service_center' && scId) ? scId : user.userId;

    const wallet = await Wallet.findOne({ ownerId, ownerType });
    if (!wallet) return errorResponse('Wallet not found', 404);
    if (wallet.balance < amount) return errorResponse('Insufficient balance', 400);

    if (method === 'bank' && !wallet.bankDetails?.accountNumber)
      return errorResponse('Please add bank details first', 400);
    if (method === 'upi' && !wallet.upiId)
      return errorResponse('Please add UPI ID first', 400);

    // Deduct from balance, move to pending
    wallet.balance      -= amount;
    wallet.pendingAmount += amount;

    const reqId = new mongoose.Types.ObjectId();

    wallet.withdrawalRequests.push({
      _id:         reqId,
      amount,
      method,
      status:      'pending',
      requestedAt: new Date(),
      upiId:       method === 'upi' ? wallet.upiId : undefined,
      bankDetails: method === 'bank' ? wallet.bankDetails : undefined,
    });

    wallet.transactions.push({
      type:         'withdrawal',
      amount,
      description:  `Withdrawal request via ${method.toUpperCase()} — pending`,
      referenceId:  reqId.toString(),
      balanceAfter: wallet.balance,
      performedBy:  new mongoose.Types.ObjectId(user.userId),
      createdAt:    new Date(),
    });

    await wallet.save();
    return successResponse(
      { balance: wallet.balance, pendingAmount: wallet.pendingAmount },
      'Withdrawal request submitted. Will be processed in 2-3 business days.'
    );
  } catch (err) {
    console.error('[WITHDRAWAL POST]', err);
    return errorResponse('Server error', 500);
  }
}

/* ── GET /api/wallet/withdrawal — list withdrawal requests ── */
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? '';   // pending|approved|rejected

    let wallets: any[];

    if (user.role === 'admin') {
      // Admin sees all pending withdrawal requests across all wallets
      wallets = await Wallet.find({ 'withdrawalRequests.0': { $exists: true } })
        .select('ownerId ownerType tenantId withdrawalRequests balance')
        .lean();
    } else {
      const ownerType: 'service_center' | 'brand' =
        user.role === 'manager' ? 'brand' : 'service_center';
      const scId    = req.headers.get('x-service-center-id');
      const ownerId = (user.role === 'service_center' && scId) ? scId : user.userId;
      const wallet  = await Wallet.findOne({ ownerId, ownerType }).lean() as any;
      wallets       = wallet ? [wallet] : [];
    }

    const requests: any[] = [];
    for (const w of wallets) {
      const reqs = (w.withdrawalRequests ?? [])
        .filter((r: any) => !status || r.status === status)
        .map((r: any) => ({
          ...r,
          walletId:  w._id,
          ownerId:   w.ownerId,
          ownerType: w.ownerType,
          tenantId:  w.tenantId,
        }));
      requests.push(...reqs);
    }

    requests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    return successResponse({ requests, total: requests.length }, 'Withdrawal requests fetched');
  } catch (err) {
    console.error('[WITHDRAWAL GET]', err);
    return errorResponse('Server error', 500);
  }
}