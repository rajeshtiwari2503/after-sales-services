import { NextRequest } from 'next/server';
import { TicketService } from '@/services/ticket.service';
import { addNoteSchema } from '@/schemas/ticket.schema';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { verifyToken } from '@/lib/jwt';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const validation = addNoteSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    const { id } = await params;
    const ticket = await TicketService.addNote(
      id,
      validation.data.content,
      validation.data.isInternal,
      user.userId,
      user.tenantId
    );

    if (!ticket) {
      return errorResponse('Ticket not found', 404);
    }

    return successResponse(ticket.notes[ticket.notes.length - 1], 'Note added successfully', 201);
  } catch (error) {
    console.error('Add note error:', error);
    return errorResponse('An error occurred', 500);
  }
}
