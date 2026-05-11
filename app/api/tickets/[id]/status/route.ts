import { NextRequest } from 'next/server';
import { TicketService } from '@/services/ticket.service';
import { updateStatusSchema } from '@/schemas/ticket.schema';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { verifyToken } from '@/lib/jwt';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    const { id } = await params;
    const ticket = await TicketService.updateStatus(
      id,
      validation.data.status,
      user.userId,
      user.tenantId,
      validation.data.reason
    );

    if (!ticket) {
      return errorResponse('Ticket not found', 404);
    }

    return successResponse(ticket, 'Status updated successfully');
  } catch (error) {
    console.error('Update status error:', error);
    return errorResponse('An error occurred', 500);
  }
}
