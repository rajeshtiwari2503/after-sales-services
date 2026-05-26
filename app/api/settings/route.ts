import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import connectDB from '@/lib/db';
import PlatformSettings, { DEFAULT_PLATFORM_SETTINGS } from '@/models/PlatformSettings';
import { audit } from '@/lib/audit-request';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '@/lib/audit';

async function getOrCreate(tenantId: string) {
  let doc = await PlatformSettings.findOne({ tenantId }).lean();
  if (!doc) {
    doc = await PlatformSettings.create({ tenantId, ...DEFAULT_PLATFORM_SETTINGS });
  }
  return doc;
}

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager'].includes(user.role)) return errorResponse('Forbidden', 403);

    await connectDB();
    const settings = await getOrCreate(user.tenantId);
    return successResponse(settings, 'Settings fetched');
  } catch (e) {
    console.error('GET settings:', e);
    return errorResponse('An error occurred', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (user.role !== 'admin') return errorResponse('Forbidden', 403);

    await connectDB();
    const body = await request.json();

    const allowed = [
      'platformName', 'supportEmail', 'maxTicketsPerDay', 'slaResponseHours', 'slaResolutionHours',
      'emailNotifications', 'smsNotifications', 'maintenanceMode', 'autoAssign', 'requirePhotos',
    ] as const;

    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const settings = await PlatformSettings.findOneAndUpdate(
      { tenantId: user.tenantId },
      { $set: update },
      { upsert: true, new: true, runValidators: true }
    );

    audit(request, user, {
      action: AUDIT_ACTIONS.SYSTEM_CONFIG,
      module: AUDIT_MODULES.SYSTEM,
      entityName: 'Platform settings',
      message: 'Platform settings updated',
      metadata: { keys: Object.keys(update) },
    });

    return successResponse(settings, 'Settings saved');
  } catch (e) {
    console.error('PATCH settings:', e);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (user.role !== 'admin') return errorResponse('Forbidden', 403);

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action !== 'reset') return errorResponse('Invalid action', 400);

    await connectDB();
    const settings = await PlatformSettings.findOneAndUpdate(
      { tenantId: user.tenantId },
      { $set: { ...DEFAULT_PLATFORM_SETTINGS } },
      { upsert: true, new: true }
    );

    audit(request, user, {
      action: AUDIT_ACTIONS.SYSTEM_CONFIG,
      module: AUDIT_MODULES.SYSTEM,
      status: 'warning',
      entityName: 'Platform settings',
      message: 'Platform settings reset to defaults',
    });

    return successResponse(settings, 'Settings reset to defaults');
  } catch (e) {
    console.error('POST settings reset:', e);
    return errorResponse('An error occurred', 500);
  }
}
