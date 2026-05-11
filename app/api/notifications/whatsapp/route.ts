 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { verifyToken } from '@/lib/jwt';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    if (!['admin', 'manager'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();
    const { phone, message, templateId } = body;

    if (!phone || (!message && !templateId)) {
      return errorResponse('Missing required fields', 400);
    }

    // Send WhatsApp message
    // In production, integrate with WhatsApp Business API
    console.log(`Sending WhatsApp to ${phone}: ${message || templateId}`);

    return successResponse(null, 'WhatsApp message sent successfully');
  } catch (error) {
    console.error('Send WhatsApp error:', error);
    return errorResponse('An error occurred', 500);
  }
}
