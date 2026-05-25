import mongoose from 'mongoose';
import Invoice from '@/models/Invoice';

function partLineDescription(partName: string, sku?: string) {
  const label = sku ? `${partName} (${sku})` : partName;
  return `Spare part: ${label}`;
}

/** Add or update invoice line when a part is logged on a ticket. */
export async function addPartToTicketInvoice(params: {
  tenantId: string;
  ticketId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  partName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}) {
  const description = partLineDescription(params.partName, params.sku);
  const lineItem = {
    description,
    quantity: params.quantity,
    unitPrice: params.unitPrice,
    total: params.total,
  };

  let invoice = await Invoice.findOne({
    tenantId: params.tenantId,
    ticketId: params.ticketId,
    status: { $in: ['draft', 'pending'] },
  });

  if (!invoice) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    return Invoice.create({
      tenantId: params.tenantId,
      customerId: params.customerId,
      ticketId: params.ticketId,
      items: [lineItem],
      subtotal: params.total,
      tax: 0,
      discount: 0,
      total: params.total,
      status: 'draft',
      dueDate,
    });
  }

  invoice.items.push(lineItem);
  invoice.subtotal = invoice.items.reduce((sum, i) => sum + i.total, 0);
  invoice.total = invoice.subtotal + (invoice.tax ?? 0) - (invoice.discount ?? 0);
  await invoice.save();
  return invoice;
}

/** Remove matching line when a part entry is removed from a ticket. */
export async function removePartFromTicketInvoice(params: {
  tenantId: string;
  ticketId: mongoose.Types.ObjectId;
  partName: string;
  sku?: string;
  total: number;
}) {
  const description = partLineDescription(params.partName, params.sku);
  const invoice = await Invoice.findOne({
    tenantId: params.tenantId,
    ticketId: params.ticketId,
    status: { $in: ['draft', 'pending'] },
  });
  if (!invoice) return;

  const idx = invoice.items.findIndex(
    (item) => item.description === description && item.total === params.total
  );
  if (idx === -1) return;

  invoice.items.splice(idx, 1);

  if (invoice.items.length === 0) {
    await invoice.deleteOne();
    return;
  }

  invoice.subtotal = invoice.items.reduce((sum, i) => sum + i.total, 0);
  invoice.total = invoice.subtotal + (invoice.tax ?? 0) - (invoice.discount ?? 0);
  await invoice.save();
}
