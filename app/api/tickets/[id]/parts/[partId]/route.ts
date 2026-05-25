// app/api/tickets/[id]/parts/[partId]/route.ts
// Remove a part entry from a ticket (restores inventory stock)

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import connectDB from '@/lib/db';
import Ticket from '@/models/Ticket';
import Inventory from '@/models/Inventory';
import { removePartFromTicketInvoice } from '@/lib/invoice-parts';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; partId: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager'].includes(user.role)) {
      return errorResponse('Only admins/managers can remove logged parts', 403);
    }

    await connectDB();
    const { id, partId } = await params;

    const ticket = await Ticket.findOne({ _id: id, tenantId: user.tenantId });
    if (!ticket) return errorResponse('Ticket not found', 404);

    const partsUsed = (ticket as any).partsUsed ?? [];
    const partIndex = partsUsed.findIndex((p: any) => p._id?.toString() === partId);
    if (partIndex === -1) return errorResponse('Part entry not found', 404);

    const partEntry = partsUsed[partIndex];

    // Restore stock to inventory
    if (partEntry.inventoryId) {
      await Inventory.findByIdAndUpdate(partEntry.inventoryId, {
        $inc: { quantity: partEntry.quantity },
      });
    }

    // Remove part from ticket
    partsUsed.splice(partIndex, 1);
    (ticket as any).partsUsed = partsUsed;

    (ticket as any).timeline.push({
      action:          'part_removed',
      description:     `Part removed: ${partEntry.partName} (x${partEntry.quantity}) — stock restored`,
      performedBy:     user.userId,
      performedByName: 'Admin',
      createdAt:       new Date(),
    });

    await ticket.save();

    try {
      await removePartFromTicketInvoice({
        tenantId: user.tenantId,
        ticketId: ticket._id,
        partName: partEntry.partName,
        sku: partEntry.sku,
        total: partEntry.total,
      });
    } catch (invoiceErr) {
      console.error('Invoice sync error (part removed):', invoiceErr);
    }

    return successResponse({ partsUsed: (ticket as any).partsUsed }, 'Part removed and stock restored');
  } catch (error) {
    console.error('Remove part error:', error);
    return errorResponse('An error occurred', 500);
  }
}
