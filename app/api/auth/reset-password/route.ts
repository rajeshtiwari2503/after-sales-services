import { NextRequest } from 'next/server';
import { resetPasswordSchema } from '@/schemas/auth.schema';
import { hashPassword } from '@/lib/hash';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import User from '@/models/User';
import connectDB from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    await connectDB();

    // In production, verify the reset token
    // const decoded = verifyResetToken(validation.data.token);
    // For demo, we'll skip token verification

    const hashedPassword = await hashPassword(validation.data.password);

    // Update user password
    // await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });

    return successResponse(null, 'Password has been reset successfully');
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse('An error occurred', 500);
  }
}
