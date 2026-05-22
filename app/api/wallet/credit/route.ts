// app/api/wallet/credit/route.ts  — NEW FILE
// Called automatically when ticket status → resolved/closed
// Also used by admin for manual credit/debit

import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import connectDB from '@/lib/db';
import Wallet from '@/models/Wallet';
import Ticket from '@/models/Ticket';
import mongoose from 'mongoose';

/* ─── POST /api/wallet/credit ────────────────────────────────────────────────
   Body (auto from ticket resolve):
     { ticketId, type:'credit'|'debit', amount?, note? }
   Body (admin manual):
     { ownerId, ownerType, tenantId, amount, type, note }
──────────────────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const body = await req.json();

    /* ── AUTO: ticket resolved → credit SC wallet ── */
    if (body.ticketId && !body.ownerId) {
      if (!['admin','manager','service_center'].includes(user.role))
        return errorResponse('Forbidden', 403);

      const ticket = await Ticket.findById(body.ticketId)
        .populate('serviceCenterId', 'name')
        .lean() as any;

      if (!ticket) return errorResponse('Ticket not found', 404);
      if (!ticket.serviceCenterId) return errorResponse('No service center on ticket', 400);

      const scId = ticket.serviceCenterId._id.toString();

      let wallet = await Wallet.findOne({ ownerId: scId, ownerType: 'service_center' });
      if (!wallet) {
        wallet = await Wallet.create({
          ownerId:   new mongoose.Types.ObjectId(scId),
          ownerType: 'service_center',
          tenantId:  ticket.tenantId,
          ticketRate: 500,
        });
      }

      // Check if this ticket was already credited
      const alreadyCredited = wallet.transactions.some(
        (t: any) => t.ticketId?.toString() === body.ticketId
      );
      if (alreadyCredited) return successResponse(null, 'Already credited');

      const amount = body.amount ?? wallet.ticketRate;
      wallet.balance      += amount;
      wallet.totalEarned  += amount;

      wallet.transactions.push({
        type:         'credit',
        amount,
        description:  `Ticket resolved: ${ticket.ticketNumber ?? 'N/A'}`,
        ticketId:     new mongoose.Types.ObjectId(body.ticketId),
        ticketNumber: ticket.ticketNumber,
        balanceAfter: wallet.balance,
        performedBy:  new mongoose.Types.ObjectId(user.userId),
        createdAt:    new Date(),
      });

      await wallet.save();
      return successResponse({ balance: wallet.balance, credited: amount }, 'Wallet credited');
    }

    /* ── MANUAL: admin credits/debits any wallet ── */
    if (user.role !== 'admin')
      return errorResponse('Forbidden: only admin can manually credit/debit', 403);

    const { ownerId, ownerType, tenantId, amount, type, note } = body;
    if (!ownerId || !ownerType || !amount || !type)
      return errorResponse('ownerId, ownerType, amount, type required', 400);

    let wallet = await Wallet.findOne({ ownerId, ownerType });
    if (!wallet) {
      wallet = await Wallet.create({
        ownerId: new mongoose.Types.ObjectId(ownerId),
        ownerType,
        tenantId: tenantId ?? 'system',
        ticketRate: 500,
      });
    }

    if (type === 'debit' && wallet.balance < amount)
      return errorResponse('Insufficient wallet balance', 400);

    if (type === 'credit') {
      wallet.balance     += amount;
      wallet.totalEarned += amount;
    } else {
      wallet.balance -= amount;
    }

    wallet.transactions.push({
      type,
      amount,
      description:  note ?? `Manual ${type} by admin`,
      balanceAfter: wallet.balance,
      performedBy:  new mongoose.Types.ObjectId(user.userId),
      createdAt:    new Date(),
    });

    await wallet.save();
    return successResponse({ balance: wallet.balance }, `Wallet ${type}ed`);
  } catch (err) {
    console.error('[WALLET CREDIT]', err);
    return errorResponse('Server error', 500);
  }
}