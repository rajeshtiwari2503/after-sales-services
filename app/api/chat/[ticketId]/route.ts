//  import { NextRequest } from 'next/server';
// import { successResponse, errorResponse } from '@/utils/apiResponse';
// import { getAuthUser } from '@/lib/auth-helper';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ ticketId: string }> }
// ) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     const { ticketId } = await params;

//     // Get messages for ticket
//     // In production, fetch from database
//     return successResponse({
//       ticketId,
//       messages: [],
//       participants: [],
//     });
//   } catch (error) {
//     console.error('Get ticket chat error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Chat from '@/models/Chat';
import User from '@/models/User';
import connectDB from '@/lib/db';
import { Types } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();

    const messages = await Chat
      .find({ ticketId: new Types.ObjectId(params.ticketId) })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 })
      .lean();

    const formatted = messages.map((m: any) => ({
      _id: m._id,
      senderId: m.sender?._id?.toString() ?? m.sender,
      senderName: m.sender?.name ?? 'Unknown',
      senderRole: m.sender?.role ?? 'unknown',
      content: m.message,
      attachments: m.attachments ?? [],
      createdAt: m.createdAt,
    }));

    return successResponse({ messages: formatted }, 'Messages fetched');
  } catch (error) {
    console.error('Get chat error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { message } = await request.json();
    if (!message?.trim()) return errorResponse('Message content required', 400);

    await connectDB();

    const chat = await Chat.create({
      ticketId: new Types.ObjectId(params.ticketId),
      sender: new Types.ObjectId(user.userId),
      message: message.trim(),
    });

    // Populate sender for response
    await chat.populate('sender', 'name role');

    const formatted = {
      _id: chat._id,
      senderId: user.userId,
      senderName: (chat as any).sender?.name ?? 'Unknown',
      content: chat.message,
      createdAt: chat.createdAt,
    };

    return successResponse(formatted, 'Message sent', 201);
  } catch (error) {
    console.error('Send chat error:', error);
    return errorResponse('An error occurred', 500);
  }
}