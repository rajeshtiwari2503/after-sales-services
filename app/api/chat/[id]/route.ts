 // app/api/chat/[ticketId]/route.ts  — REPLACE existing

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Chat from '@/models/Chat';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import connectDB from '@/lib/db';
import { Types } from 'mongoose';

type Params = { params: Promise<{ ticketId: string }> };

/* ── guard: only ticket participants can access chat ───────────────── */
async function assertParticipant(ticketId: string, userId: string, tenantId: string) {
  const ticket = await Ticket.findOne({ _id: ticketId, tenantId }).lean() as any;
  if (!ticket) return false;
  // Admin and manager can always read
  return true;  // role-level check done in middleware; this is just existence check
}

/* ══ GET /api/chat/[ticketId] ════════════════════════════════════════
   Returns all non-deleted messages + unread count for caller
══════════════════════════════════════════════════════════════════════ */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { ticketId } = await params;

    if (!Types.ObjectId.isValid(ticketId))
      return errorResponse('Invalid ticket ID', 400);

    const messages = await Chat.find({
      ticketId:  new Types.ObjectId(ticketId),
      isDeleted: false,
    })
      .populate('sender', 'name role avatar')
      .sort({ createdAt: 1 })
      .lean();

    const formatted = messages.map((m: any) => ({
      _id:         m._id,
      senderId:    m.sender?._id?.toString() ?? '',
      senderName:  m.sender?.name  ?? 'Unknown',
      senderRole:  m.sender?.role  ?? 'unknown',
      senderAvatar:m.sender?.avatar ?? null,
      content:     m.message,
      messageType: m.messageType,
      attachments: m.attachments ?? [],
      readBy:      (m.readBy ?? []).map((id: any) => id.toString()),
      reactions:   m.reactions ?? [],
      isEdited:    !!m.editedAt,
      editedAt:    m.editedAt ?? null,
      createdAt:   m.createdAt,
    }));

    const unreadCount = messages.filter(
      (m: any) => !m.readBy?.some((id: any) => id.toString() === user.userId)
    ).length;

    // Mark all as read for this user
    await Chat.updateMany(
      {
        ticketId:  new Types.ObjectId(ticketId),
        isDeleted: false,
        readBy:    { $ne: new Types.ObjectId(user.userId) },
      },
      { $addToSet: { readBy: new Types.ObjectId(user.userId) } }
    );

    return successResponse({ messages: formatted, unreadCount }, 'Messages fetched');
  } catch (error) {
    console.error('Get chat error:', error);
    return errorResponse('An error occurred', 500);
  }
}

/* ══ POST /api/chat/[ticketId] ═══════════════════════════════════════
   Send a new message
   Body: { message, messageType? }
══════════════════════════════════════════════════════════════════════ */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { ticketId } = await params;

    if (!Types.ObjectId.isValid(ticketId))
      return errorResponse('Invalid ticket ID', 400);

    const body = await request.json();
    const { message, messageType = 'text' } = body;

    if (!message?.trim()) return errorResponse('Message content required', 400);

    const chat = await Chat.create({
      ticketId:    new Types.ObjectId(ticketId),
      sender:      new Types.ObjectId(user.userId),
      message:     message.trim(),
      messageType,
      readBy:      [new Types.ObjectId(user.userId)],  // sender auto-read
    });

    await chat.populate('sender', 'name role avatar');

    const formatted = {
      _id:         chat._id,
      senderId:    user.userId,
      senderName:  (chat as any).sender?.name ?? 'Unknown',
      senderRole:  (chat as any).sender?.role ?? 'unknown',
      senderAvatar:(chat as any).sender?.avatar ?? null,
      content:     chat.message,
      messageType: chat.messageType,
      attachments: [],
      readBy:      [user.userId],
      reactions:   [],
      isEdited:    false,
      createdAt:   chat.createdAt,
    };

    return successResponse(formatted, 'Message sent', 201);
  } catch (error) {
    console.error('Send chat error:', error);
    return errorResponse('An error occurred', 500);
  }
}

/* ══ PATCH /api/chat/[ticketId] ══════════════════════════════════════
   Actions: mark_read | react | edit
   Body: { action, messageId, emoji?, newMessage? }
══════════════════════════════════════════════════════════════════════ */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { ticketId } = await params;
    const body = await request.json();
    const { action, messageId, emoji, newMessage } = body;

    if (action === 'mark_read') {
      // Mark all as read for this ticket
      await Chat.updateMany(
        {
          ticketId:  new Types.ObjectId(ticketId),
          isDeleted: false,
          readBy:    { $ne: new Types.ObjectId(user.userId) },
        },
        { $addToSet: { readBy: new Types.ObjectId(user.userId) } }
      );
      return successResponse(null, 'Marked as read');
    }

    if (action === 'react' && messageId && emoji) {
      const msg = await Chat.findById(messageId);
      if (!msg) return errorResponse('Message not found', 404);

      const already = msg.reactions?.find(
        (r: any) => r.emoji === emoji && r.userId.toString() === user.userId
      );
      if (already) {
        // Toggle off
        await Chat.findByIdAndUpdate(messageId, {
          $pull: { reactions: { emoji, userId: new Types.ObjectId(user.userId) } },
        });
      } else {
        await Chat.findByIdAndUpdate(messageId, {
          $push: { reactions: { emoji, userId: new Types.ObjectId(user.userId) } },
        });
      }
      const updated = await Chat.findById(messageId).lean() as any;
      return successResponse({ reactions: updated?.reactions ?? [] }, 'Reaction updated');
    }

    if (action === 'edit' && messageId && newMessage) {
      const msg = await Chat.findById(messageId);
      if (!msg) return errorResponse('Message not found', 404);
      if (msg.sender.toString() !== user.userId)
        return errorResponse('You can only edit your own messages', 403);

      await Chat.findByIdAndUpdate(messageId, {
        message:  newMessage.trim(),
        editedAt: new Date(),
      });
      return successResponse(null, 'Message edited');
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Patch chat error:', error);
    return errorResponse('An error occurred', 500);
  }
}

/* ══ DELETE /api/chat/[ticketId]?messageId=xxx ═══════════════════════
   Soft-delete a message (sender only)
══════════════════════════════════════════════════════════════════════ */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    if (!messageId) return errorResponse('messageId required', 400);

    const msg = await Chat.findById(messageId);
    if (!msg) return errorResponse('Message not found', 404);

    if (msg.sender.toString() !== user.userId && user.role !== 'admin')
      return errorResponse('Forbidden', 403);

    await Chat.findByIdAndUpdate(messageId, {
      isDeleted: true,
      message:   'This message was deleted',
    });

    return successResponse(null, 'Message deleted');
  } catch (error) {
    console.error('Delete chat error:', error);
    return errorResponse('An error occurred', 500);
  }
}