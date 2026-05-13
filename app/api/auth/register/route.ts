 import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { registerSchema } from '@/schemas/auth.schema';
import { errorResponse } from '@/utils/apiResponse';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    // ✅ tenantId header se ya default
    const tenantId = request.headers.get('x-tenant-id') || 'default';

    const result = await AuthService.register(validation.data, tenantId);

    if (!result.success) {
      return errorResponse(result.message || 'Registration failed', 400);
    }

    // ✅ Cookie set karo register ke baad bhi
    const response = NextResponse.json(
      { success: true, message: result.message, data: { user: result.user } },
      { status: 201 }
    );

    response.cookies.set('auth_token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('tenant_id', tenantId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('An error occurred during registration', 500);
  }
}