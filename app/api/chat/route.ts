 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    // Get active chat rooms/conversations
    // In production, implement chat storage
    return successResponse([]);
  } catch (error) {
    console.error('Get chats error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { message, recipientId, ticketId } = body;

    if (!message || (!recipientId && !ticketId)) {
      return errorResponse('Missing required fields', 400);
    }

    // Store and send message
    // In production, use WebSocket or real-time service
    const chatMessage = {
      id: Date.now().toString(),
      senderId: user.userId,
      message,
      ticketId,
      recipientId,
      timestamp: new Date(),
    };

    return successResponse(chatMessage, 'Message sent', 201);
  } catch (error) {
    console.error('Send message error:', error);
    return errorResponse('An error occurred', 500);
  }
}
