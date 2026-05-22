 // app/api/wallet/route.ts  — REPLACE existing
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import connectDB from '@/lib/db';
import Wallet from '@/models/Wallet';
import ServiceCenter from '@/models/ServiceCenter';
import mongoose from 'mongoose';

/* ── GET /api/wallet ─────────────────────────────────────────────────────────
   SC operator  → their SC wallet
   Brand manager→ their brand wallet
   Admin        → pass ?ownerId=&ownerType= to view any wallet
──────────────────────────────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page  = parseInt(searchParams.get('page')  ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const type  = searchParams.get('type') ?? '';   // credit|debit|withdrawal

    let ownerId: string;
    let ownerType: 'service_center' | 'brand';
    let tenantId: string;

    if (user.role === 'admin') {
      ownerId   = searchParams.get('ownerId')   ?? user.userId;
      ownerType = (searchParams.get('ownerType') ?? 'service_center') as any;
      tenantId  = searchParams.get('tenantId')  ?? user.tenantId;
    } else if (user.role === 'service_center') {
      const scId = req.headers.get('x-service-center-id') ?? '';
      ownerId   = scId || user.userId;
      ownerType = 'service_center';
      tenantId  = user.tenantId;
    } else if (user.role === 'manager') {
      ownerId   = user.userId;
      ownerType = 'brand';
      tenantId  = user.tenantId;
    } else {
      return errorResponse('Forbidden', 403);
    }

    // Auto-create wallet if not exists
    let wallet = await Wallet.findOne({ ownerId, ownerType });
    if (!wallet) {
      wallet = await Wallet.create({
        ownerId:   new mongoose.Types.ObjectId(ownerId),
        ownerType,
        tenantId,
        balance:       0,
        totalEarned:   0,
        totalWithdrawn:0,
        pendingAmount: 0,
        ticketRate:    500,
      });
    }

    // Filter + paginate transactions
    let txs = [...wallet.transactions].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (type) txs = txs.filter((t: any) => t.type === type);

    const total      = txs.length;
    const paginated  = txs.slice((page - 1) * limit, page * limit);

    // Pending withdrawal count
    const pendingWithdrawals = wallet.withdrawalRequests?.filter(
      (w: any) => w.status === 'pending'
    ).length ?? 0;

    return successResponse({
      balance:           wallet.balance,
      totalEarned:       wallet.totalEarned,
      totalWithdrawn:    wallet.totalWithdrawn,
      pendingAmount:     wallet.pendingAmount,
      ticketRate:        wallet.ticketRate,
      bankDetails:       wallet.bankDetails,
      upiId:             wallet.upiId,
      isActive:          wallet.isActive,
      pendingWithdrawals,
      transactions:      paginated,
      totalTransactions: total,
      page,
      totalPages:        Math.ceil(total / limit),
    }, 'Wallet fetched');
  } catch (err) {
    console.error('[WALLET GET]', err);
    return errorResponse('Server error', 500);
  }
}

/* ── PATCH /api/wallet — update bank details / UPI ─────────────────────── */
export async function PATCH(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['service_center','manager'].includes(user.role))
      return errorResponse('Forbidden', 403);

    await connectDB();
    const body = await req.json();
    const { bankDetails, upiId } = body;

    const ownerType: 'service_center' | 'brand' =
      user.role === 'manager' ? 'brand' : 'service_center';

    const scId   = req.headers.get('x-service-center-id');
    const ownerId = (user.role === 'service_center' && scId) ? scId : user.userId;

    const wallet = await Wallet.findOneAndUpdate(
      { ownerId, ownerType },
      { $set: { bankDetails, upiId } },
      { new: true, upsert: true }
    );

    return successResponse(
      { bankDetails: wallet.bankDetails, upiId: wallet.upiId },
      'Payment details updated'
    );
  } catch (err) {
    console.error('[WALLET PATCH]', err);
    return errorResponse('Server error', 500);
  }
}