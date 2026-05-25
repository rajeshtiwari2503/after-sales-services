// app/api/tickets/[id]/parts/route.ts
// Log which spare parts were used on a ticket, deduct from inventory, add to invoice

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import connectDB from '@/lib/db';
import Ticket from '@/models/Ticket';
import Inventory from '@/models/Inventory';
import { addPartToTicketInvoice } from '@/lib/invoice-parts';
import '@/models/User';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    await connectDB();
    const { id } = await params;

    const ticket = await Ticket.findOne({ _id: id, tenantId: user.tenantId })
      .select('partsUsed ticketNumber')
      .populate('partsUsed.loggedBy', 'name');

    if (!ticket) return errorResponse('Ticket not found', 404);

    const totalPartsCost = (ticket as any).partsUsed?.reduce(
      (sum: number, p: any) => sum + (p.total ?? 0), 0
    ) ?? 0;

    return successResponse({
      partsUsed: (ticket as any).partsUsed ?? [],
      totalPartsCost,
      ticketNumber: (ticket as any).ticketNumber,
    });
  } catch (error) {
    console.error('Get ticket parts error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager', 'technician', 'service_center'].includes(user.role)) {
      return errorResponse('Forbidden — only technicians or managers can log parts', 403);
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { inventoryId, quantity, notes } = body;

    if (!inventoryId || !quantity || quantity < 1) {
      return errorResponse('inventoryId and quantity (>=1) are required', 400);
    }

    // 1. Find ticket
    const ticket = await Ticket.findOne({ _id: id, tenantId: user.tenantId });
    if (!ticket) return errorResponse('Ticket not found', 404);

    // 2. Find inventory item
    const invItem = await Inventory.findOne({ _id: inventoryId, tenantId: user.tenantId, isActive: true });
    if (!invItem) return errorResponse('Inventory item not found', 404);

    // 3. Check stock
    if (invItem.quantity < quantity) {
      return errorResponse(`Insufficient stock. Available: ${invItem.quantity}`, 400);
    }

    // 4. Build part entry
    const partEntry = {
      inventoryId: invItem._id,
      partName:   invItem.name,
      sku:        invItem.sku,
      quantity,
      unitPrice:  invItem.unitPrice,
      total:      invItem.unitPrice * quantity,
      loggedBy:   user.userId,
      loggedAt:   new Date(),
      notes:      notes ?? '',
    };

    // 5. Push to ticket.partsUsed
    (ticket as any).partsUsed = (ticket as any).partsUsed ?? [];
    (ticket as any).partsUsed.push(partEntry);

    // 6. Add timeline event
    (ticket as any).timeline = (ticket as any).timeline ?? [];
    (ticket as any).timeline.push({
      action:          'part_logged',
      description:     `Part used: ${invItem.name} (x${quantity}) — ₹${(invItem.unitPrice * quantity).toLocaleString('en-IN')}`,
      performedBy:     user.userId,
      performedByName: 'Staff',
      metadata:        { partName: invItem.name, quantity, total: invItem.unitPrice * quantity },
      createdAt:       new Date(),
    });

    await ticket.save();

    // 7. Deduct from inventory
    invItem.quantity -= quantity;
    if (!invItem.lastRestockedAt) invItem.lastRestockedAt = undefined;
    await invItem.save();

    // 8. Add line item to draft invoice for this ticket
    try {
      await addPartToTicketInvoice({
        tenantId: user.tenantId,
        ticketId: ticket._id,
        customerId: (ticket as any).customerId,
        partName: invItem.name,
        sku: invItem.sku,
        quantity,
        unitPrice: invItem.unitPrice,
        total: partEntry.total,
      });
    } catch (invoiceErr) {
      console.error('Invoice sync error (part logged):', invoiceErr);
    }

    return successResponse(
      { partsUsed: (ticket as any).partsUsed, deducted: quantity, remainingStock: invItem.quantity },
      `Part logged successfully. Stock reduced to ${invItem.quantity}`,
      201
    );
  } catch (error) {
    console.error('Log part error:', error);
    return errorResponse('An error occurred', 500);
  }
}
