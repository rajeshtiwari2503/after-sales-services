import { NextRequest } from 'next/server';
import { forgotPasswordSchema } from '@/schemas/auth.schema';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import User from '@/models/User';
import connectDB from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    await connectDB();
    const tenantId = request.headers.get('x-tenant-id') || 'default';

    const user = await User.findOne({ email: validation.data.email, tenantId });

    // Always return success to prevent email enumeration
    if (user) {
      // Generate reset token and send email
      // In production, implement actual token generation and email sending
      console.log(`Password reset requested for: ${validation.data.email}`);
    }

    return successResponse(
      null,
      'If an account exists with this email, a password reset link has been sent.'
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse('An error occurred', 500);
  }
}
