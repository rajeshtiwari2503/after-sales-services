import connectDB from '@/lib/db';
import Inventory from '@/models/Inventory';
import InventoryTransfer, { TransferLine } from '@/models/InventoryTransfer';
import ServiceCenter from '@/models/ServiceCenter';
import User from '@/models/User';
import { Types } from 'mongoose';
import { NotificationService } from '@/services/notification.service';

async function nextTransferNumber(tenantId: string) {
  const count = await InventoryTransfer.countDocuments({ tenantId });
  return `TRF-${String(count + 1).padStart(6, '0')}`;
}

async function notifyScOperators(opts: {
  tenantId: string;
  serviceCenterId: string;
  title: string;
  message: string;
  link: string;
}) {
  const users = await User.find({
    tenantId: opts.tenantId,
    role: 'service_center',
    serviceCenterId: opts.serviceCenterId,
    isActive: true,
  }).select('_id');
  if (!users.length) return;
  await NotificationService.createBulk({
    userIds: users.map((u) => u._id.toString()),
    tenantId: opts.tenantId,
    title: opts.title,
    message: opts.message,
    type: 'info',
    event: 'inventory_transfer',
    link: opts.link,
  });
}

async function notifyBrandAndAdmins(opts: {
  tenantId: string;
  title: string;
  message: string;
  link: string;
}) {
  const users = await User.find({
    tenantId: opts.tenantId,
    role: { $in: ['admin', 'manager'] },
    isActive: true,
  }).select('_id');
  if (!users.length) return;
  await NotificationService.createBulk({
    userIds: users.map((u) => u._id.toString()),
    tenantId: opts.tenantId,
    title: opts.title,
    message: opts.message,
    type: 'info',
    event: 'inventory_transfer',
    link: opts.link,
  });
}

/** Brand / central warehouse stock (no SC assigned). */
export function centralWarehouseFilter(tenantId: string) {
  return {
    tenantId,
    isActive: true,
    $or: [{ serviceCenterId: { $exists: false } }, { serviceCenterId: null }],
  };
}

async function deductCentralStock(
  tenantId: string,
  lines: TransferLine[]
) {
  for (const line of lines) {
    let inv = line.inventoryId
      ? await Inventory.findOne({
          _id: line.inventoryId,
          ...centralWarehouseFilter(tenantId),
        })
      : null;

    if (!inv && line.sku) {
      inv = await Inventory.findOne({
        sku: line.sku.toUpperCase(),
        ...centralWarehouseFilter(tenantId),
      });
    }

    if (!inv) {
      throw new Error(`Central stock not found for ${line.sku}`);
    }
    if (inv.quantity < line.quantity) {
      throw new Error(`Insufficient stock for ${line.name} (have ${inv.quantity}, need ${line.quantity})`);
    }
    inv.quantity -= line.quantity;
    inv.lastRestockedAt = new Date();
    await inv.save();
  }
}

async function addToScStock(
  tenantId: string,
  serviceCenterId: Types.ObjectId,
  lines: TransferLine[]
) {
  for (const line of lines) {
    let scItem = await Inventory.findOne({
      tenantId,
      serviceCenterId,
      sku: line.sku.toUpperCase(),
      isActive: true,
    });

    if (scItem) {
      scItem.quantity += line.quantity;
      scItem.lastRestockedAt = new Date();
      await scItem.save();
      continue;
    }

    let source = line.inventoryId
      ? await Inventory.findById(line.inventoryId).lean()
      : null;

    if (!source) {
      source = await Inventory.findOne({
        tenantId,
        sku: line.sku.toUpperCase(),
        isActive: true,
      }).lean();
    }

    await Inventory.create({
      name: line.name,
      sku: line.sku.toUpperCase(),
      tenantId,
      serviceCenterId,
      category: source?.category ?? 'Spare Parts',
      description: source?.description,
      quantity: line.quantity,
      minQuantity: source?.minQuantity ?? 5,
      maxQuantity: source?.maxQuantity ?? 100,
      unitPrice: line.unitPrice ?? source?.unitPrice ?? 0,
      costPrice: source?.costPrice ?? (line.unitPrice ?? 0) * 0.7,
      brandId: source?.brandId,
      productId: source?.productId,
      categoryId: source?.categoryId,
      supplier: source?.supplier,
      location: source?.location,
      lastRestockedAt: new Date(),
    });
  }
}

export class InventoryTransferService {
  /** Admin / brand sends stock to SC immediately. */
  static async createDispatch(opts: {
    tenantId: string;
    serviceCenterId: string;
    items: TransferLine[];
    notes?: string;
    userId: string;
    userName: string;
    userRole: string;
  }) {
    await connectDB();
    const scOid = new Types.ObjectId(opts.serviceCenterId);
    const sc = await ServiceCenter.findOne({ _id: scOid, tenantId: opts.tenantId, isActive: true });
    if (!sc) throw new Error('Service center not found');

    const lines = opts.items.map((i) => ({
      ...i,
      sku: i.sku.toUpperCase(),
    }));

    await deductCentralStock(opts.tenantId, lines);

    const transfer = await InventoryTransfer.create({
      transferNumber: await nextTransferNumber(opts.tenantId),
      tenantId: opts.tenantId,
      kind: 'dispatch',
      status: 'in_transit',
      serviceCenterId: scOid,
      serviceCenterName: sc.name,
      items: lines,
      notes: opts.notes,
      createdBy: new Types.ObjectId(opts.userId),
      createdByName: opts.userName,
      createdByRole: opts.userRole,
      shippedAt: new Date(),
    });

    const link = '/service-center/inventory?tab=transfers';
    await notifyScOperators({
      tenantId: opts.tenantId,
      serviceCenterId: opts.serviceCenterId,
      title: 'Spare parts shipment incoming',
      message: `${transfer.transferNumber}: ${lines.length} item(s) dispatched to ${sc.name}. Confirm receipt when received.`,
      link,
    });

    return transfer;
  }

  /** SC requests parts from brand warehouse. */
  static async createRequest(opts: {
    tenantId: string;
    serviceCenterId: string;
    items: TransferLine[];
    notes?: string;
    userId: string;
    userName: string;
    userRole: string;
  }) {
    await connectDB();
    const scOid = new Types.ObjectId(opts.serviceCenterId);
    const sc = await ServiceCenter.findOne({ _id: scOid, tenantId: opts.tenantId });
    if (!sc) throw new Error('Service center not found');

    const lines = opts.items.map((i) => ({
      ...i,
      sku: (i.sku || `REQ-${Date.now()}`).toUpperCase(),
    }));

    const transfer = await InventoryTransfer.create({
      transferNumber: await nextTransferNumber(opts.tenantId),
      tenantId: opts.tenantId,
      kind: 'request',
      status: 'pending',
      serviceCenterId: scOid,
      serviceCenterName: sc.name,
      items: lines,
      notes: opts.notes,
      createdBy: new Types.ObjectId(opts.userId),
      createdByName: opts.userName,
      createdByRole: opts.userRole,
    });

    await notifyBrandAndAdmins({
      tenantId: opts.tenantId,
      title: 'Spare parts request',
      message: `${sc.name} requested parts (${transfer.transferNumber}). Review and dispatch from inventory.`,
      link: '/brand/inventory?tab=transfers',
    });

    return transfer;
  }

  /** Approve request and ship (deduct central + in_transit). */
  static async approveAndShip(transferId: string, userId: string, userRole: string) {
    await connectDB();
    const transfer = await InventoryTransfer.findById(transferId);
    if (!transfer) throw new Error('Transfer not found');
    if (transfer.kind !== 'request' || transfer.status !== 'pending') {
      throw new Error('Only pending requests can be approved');
    }
    if (!['admin', 'manager'].includes(userRole)) {
      throw new Error('Forbidden');
    }

    await deductCentralStock(transfer.tenantId, transfer.items);

    transfer.status = 'in_transit';
    transfer.approvedBy = new Types.ObjectId(userId);
    transfer.shippedAt = new Date();
    await transfer.save();

    await notifyScOperators({
      tenantId: transfer.tenantId,
      serviceCenterId: transfer.serviceCenterId.toString(),
      title: 'Parts request approved',
      message: `${transfer.transferNumber} has been dispatched. Confirm receipt when stock arrives.`,
      link: '/service-center/inventory?tab=transfers',
    });

    return transfer;
  }

  static async rejectRequest(transferId: string, reason: string, userRole: string) {
    await connectDB();
    const transfer = await InventoryTransfer.findById(transferId);
    if (!transfer) throw new Error('Transfer not found');
    if (transfer.kind !== 'request' || transfer.status !== 'pending') {
      throw new Error('Invalid transfer state');
    }
    if (!['admin', 'manager'].includes(userRole)) {
      throw new Error('Forbidden');
    }

    transfer.status = 'rejected';
    transfer.rejectionReason = reason;
    await transfer.save();

    await notifyScOperators({
      tenantId: transfer.tenantId,
      serviceCenterId: transfer.serviceCenterId.toString(),
      title: 'Parts request rejected',
      message: `${transfer.transferNumber} was rejected${reason ? `: ${reason}` : ''}.`,
      link: '/service-center/inventory?tab=transfers',
    });

    return transfer;
  }

  /** SC confirms receipt — add stock at SC. */
  static async confirmReceive(transferId: string, userId: string, serviceCenterId?: string) {
    await connectDB();
    const transfer = await InventoryTransfer.findById(transferId);
    if (!transfer) throw new Error('Transfer not found');
    if (transfer.status !== 'in_transit') {
      throw new Error('Transfer is not awaiting receipt');
    }

    if (serviceCenterId && transfer.serviceCenterId.toString() !== serviceCenterId) {
      throw new Error('This shipment is for another service center');
    }

    await addToScStock(transfer.tenantId, transfer.serviceCenterId, transfer.items);

    transfer.status = 'received';
    transfer.receivedBy = new Types.ObjectId(userId);
    transfer.receivedAt = new Date();
    await transfer.save();

    await notifyBrandAndAdmins({
      tenantId: transfer.tenantId,
      title: 'Shipment received',
      message: `${transfer.serviceCenterName ?? 'Service center'} confirmed receipt of ${transfer.transferNumber}.`,
      link: '/brand/inventory?tab=transfers',
    });

    return transfer;
  }
}
