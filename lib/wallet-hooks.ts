// lib/wallet-hooks.ts  — NEW FILE
// Call these from ticket API routes when status changes

import connectDB from '@/lib/db';
import Wallet from '@/models/Wallet';
import mongoose from 'mongoose';

/**
 * Called when a ticket is resolved/closed.
 * Auto-credits the service center wallet with ticketRate amount.
 */
export async function onTicketResolved(opts: {
  ticketId: string;
  ticketNumber: string;
  serviceCenterId: string;
  tenantId: string;
  performedBy: string;
}) {
  try {
    await connectDB();

    const { ticketId, ticketNumber, serviceCenterId, tenantId, performedBy } = opts;

    // Find or create SC wallet
    let wallet = await Wallet.findOne({ ownerId: serviceCenterId, ownerType: 'service_center' });
    if (!wallet) {
      wallet = await Wallet.create({
        ownerId:   new mongoose.Types.ObjectId(serviceCenterId),
        ownerType: 'service_center',
        tenantId,
        ticketRate: 500,
      });
    }

    // Prevent double-credit
    const alreadyCredited = wallet.transactions.some(
      (t: any) => t.ticketId?.toString() === ticketId && t.type === 'credit'
    );
    if (alreadyCredited) return;

    const amount = wallet.ticketRate;
    wallet.balance     += amount;
    wallet.totalEarned += amount;

    wallet.transactions.push({
      type:         'credit',
      amount,
      description:  `Ticket resolved: ${ticketNumber}`,
      ticketId:     new mongoose.Types.ObjectId(ticketId),
      ticketNumber,
      balanceAfter: wallet.balance,
      performedBy:  new mongoose.Types.ObjectId(performedBy),
      createdAt:    new Date(),
    });

    await wallet.save();
    console.log(`✅ Wallet credited ₹${amount} for ticket ${ticketNumber}`);
  } catch (err) {
    // Non-critical — don't fail the ticket update
    console.error('Wallet credit error (non-critical):', err);
  }
}