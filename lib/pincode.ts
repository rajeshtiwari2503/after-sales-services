import ServiceCenter from '@/models/ServiceCenter';
import connectDB from '@/lib/db';
import { Types } from 'mongoose';

/** Normalize Indian pincode to 6 digits (partial match uses prefix). */
export function normalizePincode(raw?: string | null): string {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  return digits.slice(0, 6);
}

/**
 * Find an active service center for a tenant by pincode.
 * Matches: exact in servicePincodes, or SC address postalCode prefix, or servicePincodes prefix.
 */
export async function findServiceCenterByPincode(
  tenantId: string,
  pincode: string
): Promise<{ _id: Types.ObjectId; name: string; code: string } | null> {
  const pin = normalizePincode(pincode);
  if (pin.length < 3) return null;

  await connectDB();

  const centers = await ServiceCenter.find({
    tenantId,
    isActive: true,
  })
    .select('name code address.postalCode servicePincodes')
    .lean();

  const exact = centers.find((sc) => {
    const pincodes = (sc.servicePincodes ?? []).map(normalizePincode).filter(Boolean);
    if (pincodes.includes(pin)) return true;
    const base = normalizePincode(sc.address?.postalCode);
    return base === pin;
  });
  if (exact) {
    return { _id: exact._id as Types.ObjectId, name: exact.name, code: exact.code };
  }

  const prefix = pin.slice(0, 3);
  const byPrefix = centers.find((sc) => {
    const pincodes = (sc.servicePincodes ?? []).map(normalizePincode).filter(Boolean);
    if (pincodes.some((p) => p.startsWith(prefix) || pin.startsWith(p.slice(0, 3)))) return true;
    const base = normalizePincode(sc.address?.postalCode);
    return base.startsWith(prefix) || pin.startsWith(base.slice(0, 3));
  });

  if (byPrefix) {
    return { _id: byPrefix._id as Types.ObjectId, name: byPrefix.name, code: byPrefix.code };
  }

  return null;
}
