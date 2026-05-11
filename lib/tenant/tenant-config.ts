 import { TenantDocument } from '@/models/Tenant';

export interface TenantConfig {
  name: string;
  slug: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  slaConfig: {
    critical: { response: number; resolution: number };
    high: { response: number; resolution: number };
    medium: { response: number; resolution: number };
    low: { response: number; resolution: number };
  };
  features: string[];
  plan: string;
}

export function getTenantConfig(tenant: TenantDocument): TenantConfig {
  return {
    name: tenant.name,
    slug: tenant.slug,
    timezone: tenant.settings?.timezone || 'UTC',
    currency: tenant.settings?.currency || 'USD',
    dateFormat: tenant.settings?.dateFormat || 'YYYY-MM-DD',
    slaConfig: tenant.settings?.slaConfig || {
      critical: { response: 1, resolution: 4 },
      high: { response: 4, resolution: 24 },
      medium: { response: 8, resolution: 48 },
      low: { response: 24, resolution: 72 },
    },
    features: tenant.features || [],
    plan: tenant.subscription?.plan || 'free',
  };
}

export function hasFeature(tenant: TenantDocument, feature: string): boolean {
  return tenant.features?.includes(feature) || false;
}

export function canAccess(tenant: TenantDocument, requiredPlan: string): boolean {
  const planHierarchy = ['free', 'starter', 'professional', 'enterprise'];
  const currentPlanIndex = planHierarchy.indexOf(tenant.subscription?.plan || 'free');
  const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
  return currentPlanIndex >= requiredPlanIndex;
}
