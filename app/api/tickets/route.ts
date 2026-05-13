// import { NextRequest } from 'next/server';
// import { TicketService } from '@/services/ticket.service';
// import { createTicketSchema } from '@/schemas/ticket.schema';
// import { successResponse, errorResponse, paginatedResponse } from '@/utils/apiResponse';
// import { verifyToken } from '@/lib/jwt';

// function getAuthUser(request: NextRequest) {
//   const authHeader = request.headers.get('authorization');
//   if (!authHeader?.startsWith('Bearer ')) return null;

//   const token = authHeader.substring(7);
//   return verifyToken(token);
// }

// export async function GET(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     const { searchParams } = new URL(request.url);
//     const options = {
//       page: parseInt(searchParams.get('page') || '1'),
//       limit: parseInt(searchParams.get('limit') || '10'),
//       status: searchParams.get('status') || undefined,
//       priority: searchParams.get('priority') || undefined,
//       category: searchParams.get('category') || undefined,
//       technicianId: searchParams.get('technicianId') || undefined,
//       customerId: searchParams.get('customerId') || undefined,
//       search: searchParams.get('search') || undefined,
//     };

//     const result = await TicketService.getTickets(user.tenantId, options);

//     return paginatedResponse(result.tickets, {
//       page: result.page,
//       limit: result.limit,
//       total: result.total,
//     });
//   } catch (error) {
//     console.error('Get tickets error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     const body = await request.json();

//     const validation = createTicketSchema.safeParse(body);
//     if (!validation.success) {
//       return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
//     }

//     const ticket = await TicketService.createTicket(
//       validation.data,
//       user.userId,
//       user.tenantId
//     );

//     return successResponse(ticket, 'Ticket created successfully', 201);
//   } catch (error) {
//     console.error('Create ticket error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }


import { NextRequest } from 'next/server';
import { TicketService } from '@/services/ticket.service';
import { createTicketSchema } from '@/schemas/ticket.schema';
import { successResponse, errorResponse, paginatedResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper'; // ✅ import karo

 

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request); // ✅ same call, kuch nahi badla
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const options = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      category: searchParams.get('category') || undefined,
      technicianId: searchParams.get('technicianId') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const result = await TicketService.getTickets(user.tenantId, options);

    return paginatedResponse(result.tickets, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request); // ✅ same call
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    const validation = createTicketSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    const ticket = await TicketService.createTicket(
      validation.data,
      user.userId,
      user.tenantId
    );

    return successResponse(ticket, 'Ticket created successfully', 201);
  } catch (error) {
    console.error('Create ticket error:', error);
    return errorResponse('An error occurred', 500);
  }
}