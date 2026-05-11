 import { headers } from 'next/headers';
import Tenant, { TenantDocument } from '@/models/Tenant';
import connectDB from '@/lib/db';

export async function getTenant(): Promise<TenantDocument | null> {
  await connectDB();

  const headersList = await headers();
  const host = headersList.get('host') || '';
  const tenantHeader = headersList.get('x-tenant-id');

  // Check for tenant header first
  if (tenantHeader) {
    return Tenant.findOne({ slug: tenantHeader, isActive: true });
  }

  // Check for subdomain
  const subdomain = host.split('.')[0];
  if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
    return Tenant.findOne({ slug: subdomain, isActive: true });
  }

  // Check for custom domain
  const tenant = await Tenant.findOne({ domain: host, isActive: true });
  if (tenant) {
    return tenant;
  }

  // Return default tenant
  return Tenant.findOne({ slug: 'default', isActive: true });
}

export async function getTenantBySlug(slug: string): Promise<TenantDocument | null> {
  await connectDB();
  return Tenant.findOne({ slug, isActive: true });
}
