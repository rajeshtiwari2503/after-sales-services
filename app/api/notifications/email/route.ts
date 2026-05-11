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
    const { to, subject, content } = body;

    if (!to || !subject || !content) {
      return errorResponse('Missing required fields', 400);
    }

    // Send email
    // In production, use email service
    console.log(`Sending email to ${to}: ${subject}`);

    return successResponse(null, 'Email sent successfully');
  } catch (error) {
    console.error('Send email error:', error);
    return errorResponse('An error occurred', 500);
  }
}
