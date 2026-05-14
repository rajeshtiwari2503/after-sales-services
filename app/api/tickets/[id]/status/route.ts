//  import { NextRequest } from 'next/server';
// import { TicketService } from '@/services/ticket.service';
// import { errorResponse, successResponse } from '@/utils/apiResponse';
// import { getAuthUser } from '@/lib/auth-helper';

// export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) return errorResponse('Unauthorized', 401);

//     const { status } = await request.json();
//     const ticket = await TicketService.changeStatus(params.id, status, user.userId, user.tenantId);

//     return successResponse(ticket, 'Status updated');
//   } catch (error) {
//     return errorResponse('An error occurred', 500);
//   }
// }

import { NextRequest } from 'next/server';
import { TicketService } from '@/services/ticket.service';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    // ✅ Await params
    const { id } = await params;

    const { status } = await request.json();

    const ticket = await TicketService.changeStatus(
      id,
      status,
      user.userId,
      user.tenantId
    );

    return successResponse(ticket, 'Status updated');
  } catch (error) {
    console.error(error);
    return errorResponse('An error occurred', 500);
  }
}