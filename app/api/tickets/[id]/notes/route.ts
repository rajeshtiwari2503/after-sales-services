import { NextRequest } from 'next/server';
import { TicketService } from '@/services/ticket.service';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { content, isInternal } = await request.json();
    if (!content?.trim()) return errorResponse('Note content is required', 400);

    const ticket = await TicketService.addNote(
      params.id, { content, isInternal: !!isInternal },
      user.userId, user.tenantId
    );

    return successResponse(ticket, 'Note added');
  } catch (error) {
    console.error('Add note error:', error);
    return errorResponse('An error occurred', 500);
  }
}