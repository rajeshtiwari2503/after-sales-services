 
// import { NextRequest, NextResponse } from 'next/server';
// import { AuthService } from '@/services/auth.service';
// import { loginSchema } from '@/schemas/auth.schema';
// import { errorResponse } from '@/utils/apiResponse';
 
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();

//     console.log('\n========== LOGIN DEBUG START ==========');
//     console.log('📨 Request body:', JSON.stringify(body));

//     const validation = loginSchema.safeParse(body);
//     if (!validation.success) {
//       console.log('❌ Validation failed:', validation.error.flatten().fieldErrors);
//       return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
//     }

//     console.log('✅ Validation passed');
//     console.log('📧 Email:', validation.data.email);
//     console.log('🔑 Password length:', validation.data.password?.length);

//     const tenantId = request.headers.get('x-tenant-id') || 'default';
//     console.log('🏢 TenantId:', tenantId);

//     let result;
//     try {
//       result = await AuthService.login(validation.data, tenantId);
//       console.log('🔐 AuthService result:', JSON.stringify({
//         success: result.success,
//         message: result.message,
//         hasToken: !!result.token,
//         user: result.user,
//       }));
//     } catch (serviceError) {
//       console.error('💥 AuthService threw error:', serviceError);
//       return errorResponse('Auth service error', 500);
//     }

//     if (!result.success) {
//       console.log('❌ Login failed — reason:', result.message);
//       console.log('========== LOGIN DEBUG END ==========\n');
//       return errorResponse(result.message || 'Invalid credentials', 401);
//     }

//     console.log('✅ Login successful for:', result.user?.email);
//     console.log('========== LOGIN DEBUG END ==========\n');

//     const response = NextResponse.json(
//       { success: true, message: result.message, data: { user: result.user } },
//       { status: 200 }
//     );

//     response.cookies.set('auth_token', result.token!, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 60 * 60 * 24 * 7,
//       path: '/',
//     });

//     response.cookies.set('tenant_id', tenantId, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 60 * 60 * 24 * 7,
//       path: '/',
//     });

//     return response;
//   } catch (error) {
//     console.error('💥 Unexpected error:', error);
//     return errorResponse('An error occurred during login', 500);
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { loginSchema } from '@/schemas/auth.schema';
import { errorResponse } from '@/utils/apiResponse';

import {
  writeAuditLog,
  getClientIP,
  AUDIT_MODULES,
  AUDIT_ACTIONS,
} from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('\n========== LOGIN DEBUG START ==========');
    console.log('📨 Request body:', JSON.stringify(body));

    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      console.log(
        '❌ Validation failed:',
        validation.error.flatten().fieldErrors
      );

      return errorResponse(
        'Validation failed',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    console.log('✅ Validation passed');
    console.log('📧 Email:', validation.data.email);
    console.log(
      '🔑 Password length:',
      validation.data.password?.length
    );

    const tenantId =
      request.headers.get('x-tenant-id') || 'default';

    console.log('🏢 TenantId:', tenantId);

    let result;

    try {
      result = await AuthService.login(
        validation.data,
        tenantId
      );

      console.log(
        '🔐 AuthService result:',
        JSON.stringify({
          success: result.success,
          message: result.message,
          hasToken: !!result.token,
          user: result.user,
        })
      );
    } catch (serviceError) {
      console.error(
        '💥 AuthService threw error:',
        serviceError
      );

      return errorResponse(
        'Auth service error',
        500
      );
    }

    if (!result.success) {
      console.log(
        '❌ Login failed — reason:',
        result.message
      );

      // ✅ FAILED LOGIN AUDIT
      await writeAuditLog({
        userId: 'unknown',
        userName: 'Unknown',
        userEmail: validation.data.email,
        userRole: 'guest',
        tenantId,
        ipAddress: getClientIP(request),
        userAgent:
          request.headers.get('user-agent') ??
          undefined,

        action: AUDIT_ACTIONS.LOGIN,

        module: AUDIT_MODULES.AUTH,

        status: 'failed',

        message: `Failed login attempt for ${validation.data.email}`,
      });

      console.log(
        '========== LOGIN DEBUG END ==========\n'
      );

      return errorResponse(
        result.message || 'Invalid credentials',
        401
      );
    }

    console.log(
      '✅ Login successful for:',
      result.user?.email
    );

    // ✅ SUCCESS LOGIN AUDIT
    await writeAuditLog({
      userId:
        
        result.user?.id ? result.user.id.toString() : 'unknown',

      userName:
        result.user?.name || 'Unknown',

      userEmail:
        result.user?.email || validation.data.email,

      userRole:
        result.user?.role || 'user',

      tenantId:
        result.user?.tenantId || tenantId,

      ipAddress: getClientIP(request),

      userAgent:
        request.headers.get('user-agent') ??
        undefined,

      action: AUDIT_ACTIONS.LOGIN,

      module: AUDIT_MODULES.AUTH,

      status: 'success',

      message: `User ${result.user?.email} logged in successfully`,
    });

    console.log(
      '========== LOGIN DEBUG END ==========\n'
    );

    const response = NextResponse.json(
      {
        success: true,
        message: result.message,
        data: {
          user: result.user,
        },
      },
      {
        status: 200,
      }
    );

    response.cookies.set(
      'auth_token',
      result.token!,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          'production',

        sameSite: 'lax',

        maxAge:
          60 * 60 * 24 * 7,

        path: '/',
      }
    );

    response.cookies.set(
      'tenant_id',
      tenantId,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          'production',

        sameSite: 'lax',

        maxAge:
          60 * 60 * 24 * 7,

        path: '/',
      }
    );

    return response;
  } catch (error) {
    console.error(
      '💥 Unexpected error:',
      error
    );

    return errorResponse(
      'An error occurred during login',
      500
    );
  }
}